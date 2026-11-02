// Spara som: backend/src/middlewares/cookie-jwt.js  (ersätter den gamla)

module.exports = () => {
  // Inställningar för cookien. Samma används vid login och logout
  const cookieOptions = {
    httpOnly: true, // JavaScript i webbläsaren kan inte läsa cookien
    secure: process.env.NODE_ENV === "production", // kräver https i produktion
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // "lax" för localhost
    maxAge: 8 * 60 * 60 * 1000, // 8 timmar (en arbetsdag). Ska matcha accessTokenLifespan i plugins.js
  };

  return async (ctx, next) => {
    // Logout: radera cookien
    if (ctx.path === "/api/auth/logout" && ctx.method === "POST") {
      ctx.cookies.set("jwt", null, cookieOptions);
      ctx.body = { ok: true };
      return;
    }

    // Finns en cookie? Gör om den till en Authorization-header, så att Strapi vet vem som är inloggad.
    //
    // VIKTIGT: Gör det INTE för /api/auth/... (inloggning och registrering).
    // De anropen ska vara öppna för alla. Skickar vi med en gammal eller utgången
    // token där svarar Strapi 401 redan innan lösenordet kontrolleras, och
    // man kan då inte logga in igen.
    const jwt = ctx.cookies.get("jwt");
    const isAuthRoute = ctx.path.startsWith("/api/auth/");
    if (jwt && !isAuthRoute && !ctx.request.header.authorization) {
      ctx.request.header.authorization = `Bearer ${jwt}`;
    }

    await next();

    // Login: lägg jwt i cookien och ta bort den ur svaret
    if (
      ctx.path === "/api/auth/local" &&
      ctx.method === "POST" &&
      ctx.body &&
      ctx.body.jwt
    ) {
      ctx.cookies.set("jwt", ctx.body.jwt, cookieOptions);
      delete ctx.body.jwt;
    }

    // OBS: Förnyelsen av cookien är borttagen. Den gav 403 med jwtManagement: "refresh"
  };
};
