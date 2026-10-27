// adminPaths.js
// Var admin-sidan ligger i webbläsaren.

// Alla admin-sidor börjar med /admin
export const ADMIN_BASE = '/admin';

// Bygger hela adressen för en sektion.
// sectionUrl('')           -> '/admin'
// sectionUrl('anvandare')  -> '/admin/anvandare'
export function sectionUrl(path) {
  if (path === '') {
    return ADMIN_BASE;
  }
  return ADMIN_BASE + '/' + path;
}