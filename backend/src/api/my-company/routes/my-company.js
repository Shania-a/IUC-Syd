'use strict';

/**
 * Routes för sidan Mitt företag.
 *
 * De kräver inloggning. Rollen Authenticated måste få behörighet till
 * find, setCompanyConsent och suggestContactPerson under My-company
 * i Strapi (Settings > Users & Permissions > Roles > Authenticated).
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/my-company',
      handler: 'my-company.find',
      config: { policies: [] },
    },
    {
      method: 'PUT',
      path: '/my-company/contact-persons/:documentId/consent',
      handler: 'my-company.setCompanyConsent',
      config: { policies: [] },
    },
    
  ],
};