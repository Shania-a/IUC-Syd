// Anrop för communityt. Går mot egna routes under /api/posts i Strapi.
// credentials: "include" gör att webbläsaren skickar med inloggningscookien.

const API_URL = "http://localhost:1337/api";

/**
 * Hämtar de senaste inläggen, nyast först.
 * Kastar ett Error med needsLogin = true när användaren inte är inloggad.
 */
export async function fetchPosts() {
  const result = await requestJson("/posts");
  return result.posts;
}

/**
 * Publicerar ett inlägg. Tar emot { content, postType, topic }.
 * Returnerar det sparade inlägget.
 */
export async function createPost(draft) {
  const result = await requestJson("/posts", { method: "POST", body: draft });
  return result.post;
}

/**
 * Sparar en kommentar på ett inlägg. Returnerar den sparade kommentaren.
 */
export async function createComment(postDocumentId, content) {
  const result = await requestJson(`/posts/${encodeURIComponent(postDocumentId)}/comments`, {
    method: "POST",
    body: { content },
  });
  return result.comment;
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
      `403 från ${path}. Är du inloggad, kontrollera att rollen har behörighet till Post i Strapi.`,
    );
  }

  const error = new Error(describeFailure(response.status, result));
  error.needsLogin = response.status === 401 || response.status === 403;
  throw error;
}

function describeFailure(status, result) {
  if (status === 401 || status === 403) return "Logga in för att se communityt.";
  return result?.error?.message || `Något gick fel (felkod ${status}). Försök igen.`;
}