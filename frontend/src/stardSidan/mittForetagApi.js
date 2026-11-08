// Anrop för sidan Mitt företag. Allt går via egna routes under /api/my-company
// så att en medlem bara kan läsa och ändra sitt eget företag.

const API_URL = "http://localhost:1337/api";

/**
 * Hämtar den inloggades företag och dess kontaktpersoner.
 * Returnerar { company, contactPersons }. Kastar ett Error med needsLogin = true
 * när användaren inte är inloggad.
 */
export function fetchMyCompany() {
  return requestJson("/my-company");
}

/**
 * Sätter företagets samtycke för en godkänd kontaktperson.
 * Returnerar den uppdaterade kontaktpersonen.
 */
export async function setCompanyConsent(contactPersonId, companyConsent) {
  const result = await requestJson(
    `/my-company/contact-persons/${encodeURIComponent(contactPersonId)}/consent`,
    { method: "PUT", body: { companyConsent } },
  );
  return result.contactPerson;
}



async function requestJson(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Kunde inte nå portalen. Kontrollera anslutningen och försök igen.");
  }

  const result = await response.json().catch(() => null);
  if (response.ok) return result;

  if (response.status === 403) {
    // Strapi svarar 403 både när man är utloggad och när rollen saknar behörighet.
    console.warn(
      `403 från ${path}. Är du inloggad, kontrollera att rollen Authenticated har behörighet till My-company i Strapi.`,
    );
  }

  const error = new Error(describeFailure(response.status, result));
  error.needsLogin = response.status === 401 || response.status === 403;
  throw error;
}

function describeFailure(status, result) {
  if (status === 401 || status === 403) return "Logga in för att se ert företag.";
  return result?.error?.message || `Något gick fel (felkod ${status}). Försök igen.`;
}