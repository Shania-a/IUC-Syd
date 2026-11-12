// Små hjälpfunktioner som flera delar av communityt använder.

/** Returnerar upp till två initialer av ett namn, till exempel "AL" för "Anna Lindqvist". */
export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

const publishedTimeFormat = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** Gör om en tidpunkt från Strapi till text, till exempel "11 nov. 12:39". */
export function formatPublishedTime(isoTime) {
  return publishedTimeFormat.format(new Date(isoTime));
}