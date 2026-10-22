// Strapi kör den här funktionen när servern startar och sparar svaret som en middleware
module.exports = () => {
  // Inställningar för cookien. Samma används vid login och logout
  const cookieOptions = {
    httpOnly: true, // JavaScript i webbläsaren kan inte läsa cookien (skyddar mot att den stjäls)
    secure: process.env.NODE_ENV === "production", // Kräver https, men bara i produktion (localhost kör http)
    sameSite: "strict", // Cookien skickas bara från din egen sajt (skyddar mot CSRF)
    maxAge: 60 * 60 * 1000, // Cookien lever i 1 timme (angivet i millisekunder)
  };

  // Den här funktionen körs vid varje anrop till Strapi
  // ctx = anropet och svaret, next = "kör nästa steg i Strapi"
  return async (ctx, next) => {
    // Är det ett POST-anrop till /api/auth/logout? Då vill användaren logga ut
    if (ctx.path === "/api/auth/logout" && ctx.method === "POST") {
      ctx.cookies.set("jwt", null, cookieOptions); // Töm cookien så att den raderas
      ctx.body = { ok: true }; // Skicka tillbaka ett enkelt svar till frontend
      return; // Avsluta här, resten av koden behövs inte vid logout
    }

    // Hämta jwt från cookien som webbläsaren skickade med (finns inte om man är utloggad)
    const jwt = ctx.cookies.get("jwt");
    // Om cookien finns och anropet inte redan har en Authorization-header...
    if (jwt && !ctx.request.header.authorization) {
      // ...lägg till den, så att Strapi tror att token kom på det vanliga sättet
      ctx.request.header.authorization = `Bearer ${jwt}`;
    }

    // Släpp vidare anropet till Strapi, som hanterar det (här sker själva inloggningen)
    // Koden nedanför körs först när Strapi är klar och svaret är på väg tillbaka
    await next();

    // Var det ett POST-anrop till /api/auth/local? Då försökte någon logga in
    if (
      ctx.path === "/api/auth/local" &&
      ctx.method === "POST" &&
      ctx.body && // Finns det något svar?
      ctx.body.jwt // Och innehåller svaret en jwt? (den finns bara om inloggningen lyckades)
    ) {
      ctx.cookies.set("jwt", ctx.body.jwt, cookieOptions); // Spara jwt i cookien med inställningarna ovan
      delete ctx.body.jwt; // Ta bort jwt ur svaret, så frontend aldrig ser den
    }
  };
};
