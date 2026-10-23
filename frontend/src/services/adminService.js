/**
 * adminService.js
 *
 * ALL dataåtkomst för admin-sidan går genom den här filen.
 * Komponenterna vet inte om datan kommer från en JSON-fil eller från Strapi,
 * så när backend är klar byter vi bara ut innehållet i funktionerna här.
 *
 * Just nu: datan läses från mockData.json och hålls i minnet.
 * Ändringar försvinner när sidan laddas om (det är meningen med mock-data).
 */
import mockData from '../data/mockData.json';

// Används senare: lägg VITE_STRAPI_URL=http://localhost:1337 i frontend/.env
export const STRAPI_URL = import.meta.env.VITE_STRAPI_URL ?? 'http://localhost:1337';

// En kopia så att vi inte ändrar själva JSON-importen
let db = structuredClone(mockData);

// Låtsas att det tar lite tid, som ett riktigt nätverksanrop.
// Då ser vi direkt om laddningslägen och knappar beter sig rätt.
const fakeNetwork = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

/** Uppdatera en post i en samling och returnera den nya versionen. */
function patch(collection, id, changes) {
  const list = db[collection];
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) throw new Error(`Hittade inte ${collection}/${id}`);
  list[index] = { ...list[index], ...changes };
  return structuredClone(list[index]);
}

const now = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Läsa
// ---------------------------------------------------------------------------

/**
 * Hämtar allt admin-översikten behöver i ett anrop.
 * Strapi: flera GET-anrop, t.ex.
 *   GET /api/users?populate=company
 *   GET /api/companies
 *   GET /api/posts?filters[status][$in]=reported,pending
 *   GET /api/messages?populate=fromUser&sort=createdAt:desc
 */
export async function fetchAdminData() {
  await fakeNetwork(350);
  return structuredClone(db);
}

// ---------------------------------------------------------------------------
// Användare  (Strapi: Users & Permissions, fälten confirmed/blocked)
// ---------------------------------------------------------------------------

/** Strapi: PUT /api/users/:id  { confirmed: true, blocked: false } */
export async function approveUser(id) {
  await fakeNetwork();
  return patch('users', id, { status: 'approved', approvedAt: now() });
}

/** Strapi: PUT /api/users/:id  { blocked: true } */
export async function blockUser(id) {
  await fakeNetwork();
  return patch('users', id, { status: 'blocked' });
}

/** Strapi: PUT /api/users/:id  { blocked: false } */
export async function unblockUser(id) {
  await fakeNetwork();
  return patch('users', id, { status: 'approved' });
}

/** Strapi: egen endpoint eller e-postplugin. Skickar påminnelse om samtycke. */
export async function sendConsentReminder(userId) {
  await fakeNetwork();
  return patch('users', userId, { consentReminderSentAt: now() });
}

// ---------------------------------------------------------------------------
// Moderering  (Strapi: PUT /api/posts/:id  { status })
// ---------------------------------------------------------------------------

/**
 * status: 'kept' | 'approved' | 'unpublished' | 'removed'
 * 'removed' sparas som status i stället för att raderas, så att det finns spår.
 */
export async function moderatePost(id, status) {
  await fakeNetwork();
  return patch('posts', id, { status, moderatedAt: now() });
}

// ---------------------------------------------------------------------------
// Privata meddelanden
// ---------------------------------------------------------------------------

/** Strapi: PUT /api/messages/:id  { status: 'read' } */
export async function markMessageRead(id) {
  await fakeNetwork(100);
  return patch('messages', id, { status: 'read' });
}

/** Strapi: POST /api/message-replies  { message: id, text }, sedan e-post till medlemmen */
export async function replyToMessage(id, text) {
  await fakeNetwork();
  const message = db.messages.find((m) => m.id === id);
  const reply = { id: `r${Date.now()}`, text, author: 'IUC Syd', createdAt: now() };
  return patch('messages', id, { status: 'replied', replies: [...message.replies, reply] });
}

// ---------------------------------------------------------------------------
// Identifierade behov
// ---------------------------------------------------------------------------

/** Strapi: PUT /api/needs/:id  { status: 'handled' } */
export async function markNeedHandled(id) {
  await fakeNetwork();
  return patch('needs', id, { status: 'handled' });
}

// ---------------------------------------------------------------------------
// Företag  (Strapi: /api/companies)
// ---------------------------------------------------------------------------

/** Strapi: POST /api/companies  { data: values } */
export async function createCompany(values) {
  await fakeNetwork();
  const company = { id: `c${Date.now()}`, ...values };
  db.companies.push(company);
  return structuredClone(company);
}

/** Strapi: PUT /api/companies/:documentId  { data: values } */
export async function updateCompany(id, values) {
  await fakeNetwork();
  return patch('companies', id, values);
}