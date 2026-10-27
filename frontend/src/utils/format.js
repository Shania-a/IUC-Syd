/**
 * format.js
 * Små hjälpfunktioner för att visa namn och datum på samma sätt överallt.
 */

/** "Sara Holm" från ett användarobjekt */
export const fullName = (user) => (user ? `${user.firstName} ${user.lastName}` : 'Okänd användare');

/** "SH" från "Sara Holm", används i de runda avatarerna */
export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

/** "idag", "igår", "3 dagar sedan" eller ett datum om det är längre sedan */
export function timeAgo(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
  if (days <= 0) return 'idag';
  if (days === 1) return 'igår';
  if (days < 7) return `${days} dagar sedan`;
  return formatDate(iso);
}

/** "3 sep." från ett ISO-datum */
export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }) : '';