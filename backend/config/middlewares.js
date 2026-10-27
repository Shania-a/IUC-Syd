module.exports = [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  {
    // Före: bara "strapi::cors". Nu med egna inställningar
    name: "strapi::cors",
    config: {
      // Vilken frontend-adress som får prata med Strapi (din Vite-server)
      // Byt till din riktiga adress när ni deployar
      origin: ["http://localhost:5173"],
      // Tillåter att cookies skickas mellan frontend och Strapi
      // Utan den ignorerar webbläsaren cookien
      credentials: true,
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  // Din egen middleware i src/middlewares/cookie-jwt.js
  // Namnet efter "global::" måste vara samma som filnamnet
  "global::cookie-jwt",
];
