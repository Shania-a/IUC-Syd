'use strict';

/**
 * Controller för sidan Mitt företag.
 *
 * En medlem når bara sitt eget företag. Företaget slås alltid upp från den
 * inloggade användaren, aldrig från något id som skickas i anropet.
 */

const COMPANY = 'api::company.company';
const CONTACT_PERSON = 'api::contact-person.contact-person';


module.exports = ({ strapi }) => ({
  /**
   * GET /api/my-company
   * Svarar med { company, contactPersons }. Nekade förslag tas inte med.
   */
  async find(ctx) {
    const company = await loadCompanyForRequest(strapi, ctx);
    if (!company) return;

    const contactPersons = await strapi.documents(CONTACT_PERSON).findMany({
      filters: {
        company: { documentId: { $eq: company.documentId } },
        approvalStatus: { $ne: 'rejected' },
      },
      sort: [{ isMainContact: 'desc' }, { createdAt: 'asc' }],
    });

    ctx.body = {
      company: toCompanyResponse(company),
      contactPersons: contactPersons.map(toContactPersonResponse),
    };
  },

  /**
   * PUT /api/my-company/contact-persons/:documentId/consent
   * Tar emot { companyConsent: true | false }. Svarar med { contactPerson }.
   */
  async setCompanyConsent(ctx) {
    const company = await loadCompanyForRequest(strapi, ctx);
    if (!company) return;

    const { companyConsent } = ctx.request.body ?? {};
    if (typeof companyConsent !== 'boolean') {
      return ctx.badRequest(
        `companyConsent måste vara true eller false, fick ett värde av typen ${typeof companyConsent}.`
      );
    }

    const contactPerson = await findContactPersonInCompany(strapi, ctx.params.documentId, company);
    if (!contactPerson) {
      return ctx.notFound('Kontaktpersonen finns inte på ert företag.');
    }
    if (contactPerson.approvalStatus !== 'approved') {
      return ctx.badRequest('Samtycke kan ges först när IUC Syd har godkänt kontaktpersonen.');
    }

    const updated = await strapi.documents(CONTACT_PERSON).update({
      documentId: contactPerson.documentId,
      data: { companyConsent },
    });

    ctx.body = { contactPerson: toContactPersonResponse(updated) };
  },

  /**
   * POST /api/my-company/contact-persons
   * Tar emot { name, jobTitle, phone, email }. Sparas som förslag (pending)
   * som IUC Syd godkänner eller nekar. Svarar 201 med { contactPerson }.
   */
  async suggestContactPerson(ctx) {
    const company = await loadCompanyForRequest(strapi, ctx);
    if (!company) return;

    const { suggestion, problem } = readSuggestion(ctx.request.body);
    if (problem) return ctx.badRequest(problem);

    const existing = await strapi.documents(CONTACT_PERSON).findFirst({
      filters: {
        company: { documentId: { $eq: company.documentId } },
        email: { $eqi: suggestion.email },
        approvalStatus: { $ne: 'rejected' },
      },
    });
    if (existing) {
      return ctx.badRequest('Det finns redan en kontaktperson eller ett förslag med den e-postadressen.');
    }

    const created = await strapi.documents(CONTACT_PERSON).create({
      data: {
        ...suggestion,
        approvalStatus: 'pending',
        isMainContact: false,
        companyConsent: false,
        personConsent: false,
        company: company.documentId,
      },
    });

    ctx.status = 201;
    ctx.body = { contactPerson: toContactPersonResponse(created) };
  },
});

/**
 * Returnerar företaget för den inloggade användaren.
 * Returnerar null och har då redan satt felsvaret på ctx.
 */
async function loadCompanyForRequest(strapi, ctx) {
  const user = ctx.state.user;
  if (!user) {
    ctx.unauthorized('Logga in för att se ert företag.');
    return null;
  }

  const company = await findCompanyForUser(strapi, user);
  if (!company) {
    ctx.notFound('Ditt konto är inte kopplat till något företag i portalen. Kontakta IUC Syd.');
    return null;
  }
  return company;
}

// company_id på användaren innehåller företagets namn. Det är så Sign_up.jsx sparar det.
async function findCompanyForUser(strapi, user) {
  if (!user.company_id) return null;

  const companies = strapi.documents(COMPANY);
  const query = { filters: { name: { $eq: user.company_id } } };

  // Ett företag som skapats i Strapi-admin men aldrig publicerats finns bara som utkast.
  return (
    (await companies.findFirst({ ...query, status: 'published' })) ??
    (await companies.findFirst(query))
  );
}

function findContactPersonInCompany(strapi, contactPersonId, company) {
  return strapi.documents(CONTACT_PERSON).findFirst({
    filters: {
      documentId: { $eq: contactPersonId },
      company: { documentId: { $eq: company.documentId } },
    },
  });
}

/**
 * Läser och tvättar ett förslag från anropet.
 * Returnerar { suggestion } eller { problem } med ett meddelande till användaren.
 */
function readSuggestion(body) {
  const suggestion = {
    name: cleanText(body?.name),
    jobTitle: cleanText(body?.jobTitle),
    phone: cleanText(body?.phone),
    email: cleanText(body?.email).toLowerCase(),
  };

  if (!suggestion.name) return { problem: 'Fyll i namn.' };
  if (!suggestion.email) return { problem: 'Fyll i e-post.' };
  if (Object.values(suggestion).some((value) => value.length > MAX_FIELD_LENGTH)) {
    return { problem: `Ett av fälten är för långt. Max ${MAX_FIELD_LENGTH} tecken per fält.` };
  }
  if (!EMAIL_PATTERN.test(suggestion.email)) {
    return { problem: 'E-postadressen ser inte ut att stämma. Kontrollera stavningen.' };
  }
  return { suggestion };
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toCompanyResponse(company) {
  return {
    documentId: company.documentId,
    name: company.name,
    city: company.city ?? '',
    industry: company.industry ?? '',
    description: company.description ?? '',
    email: company.email ?? '',
    phone: company.phone ?? '',
  };
}

function toContactPersonResponse(contactPerson) {
  return {
    documentId: contactPerson.documentId,
    name: contactPerson.name,
    jobTitle: contactPerson.jobTitle ?? '',
    email: contactPerson.email ?? '',
    phone: contactPerson.phone ?? '',
    approvalStatus: contactPerson.approvalStatus,
    isMainContact: Boolean(contactPerson.isMainContact),
    companyConsent: Boolean(contactPerson.companyConsent),
    personConsent: Boolean(contactPerson.personConsent),
  };
}