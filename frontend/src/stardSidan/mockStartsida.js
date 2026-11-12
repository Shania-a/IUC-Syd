// Tillfällig data tills nyheter och event finns i Strapi eller hämtas från Ungapped.
// Datum skrivs som ÅÅÅÅ-MM-DD, samma format som Strapi använder för datumfält.

export const mockNews = [
  {
    id: "kickstart-ai",
    date: "2026-11-09",
    title: "Anmälan öppen: vinterns Kickstart AI",
    summary:
      "Introduktionsworkshop för medlemsföretag som vill komma igång med AI i produktionen. Platserna är begränsade.",
    isPinned: true,
  },
  {
    id: "produktionslyftet",
    date: "2026-11-03",
    title: "Ny omgång av Produktionslyftet startar i vår",
    summary: "Intresseanmälan är öppen för medlemmar.",
    isPinned: false,
  },
  {
    id: "kompetensstod",
    date: "2026-10-24",
    title: "Nytt stöd för kompetensutveckling i industrin",
    summary: "Sammanfattning av vad som gäller för er som medlem.",
    isPinned: false,
  },
];

// signupUrl leder till IUC Syds eventsida tills varje event har en egen anmälningslänk.
export const mockEvents = [
  {
    id: "natverkstraff-automation",
    date: "2026-11-19",
    title: "Nätverksträff: Automation",
    place: "Utvecklingscentret, Malmö",
    summary: "Träffa andra medlemmar som automatiserar delar av sin produktion.",
    signupUrl: "https://iucsyd.se/event/",
  },
  {
    id: "webinar-cybersakerhet",
    date: "2026-11-26",
    title: "Webinar: Cybersäkerhet för tillverkande företag",
    place: "Digitalt",
    summary: "Genomgång av de kundkrav som blir vanligare och hur ni möter dem.",
    signupUrl: "https://iucsyd.se/event/",
  },
  {
    id: "workshop-5s",
    date: "2026-12-03",
    title: "Workshop: Effektivisering och 5S",
    place: "Hos ett medlemsföretag i Skåne",
    summary: "Praktisk workshop på plats i en produktion som har infört 5S.",
    signupUrl: "https://iucsyd.se/event/",
  },
];