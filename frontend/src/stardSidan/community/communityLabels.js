// Typer och ämnen för inlägg i communityt.
// value måste stämma med listorna i backend/src/api/post/content-types/post/schema.json.
// label är texten användaren ser.

export const POST_TYPES = [
  {
    value: "fraga",
    label: "Fråga",
    hint: "Du vill ha svar eller råd från andra medlemmar.",
  },
  {
    value: "samarbete",
    label: "Söker samarbete",
    hint: "Du letar efter ett företag att göra något tillsammans med.",
  },
  {
    value: "erfarenhet",
    label: "Erfarenhet",
    hint: "Du delar något ni har lärt er som andra kan ha nytta av.",
  },
];

export const TOPICS = [
  { value: "effektivisering", label: "Effektiviseringar inom produktion" },
  { value: "automation", label: "Automation" },
  { value: "ai", label: "Artificiell intelligens" },
  { value: "digitalisering", label: "Digitaliserad och uppkopplad produktion" },
  { value: "hallbarhet", label: "Hållbarhet" },
  { value: "affarsutveckling", label: "Utveckla affären" },
  { value: "kompetensutveckling", label: "Kompetensutveckling" },
  { value: "cybersakerhet", label: "Cybersäkerhet" },
  { value: "produktutveckling", label: "Produktutveckling och nya material" },
  { value: "rekrytering", label: "Attrahera framtida medarbetare" },
  { value: "annat", label: "Annat" },
];

export function getPostTypeLabel(value) {
  return findLabel(POST_TYPES, value);
}

export function getTopicLabel(value) {
  return findLabel(TOPICS, value);
}

// Ett värde som saknas i listan visas som det är i stället för att försvinna.
function findLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? value;
}