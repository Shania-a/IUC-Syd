// Spara som: backend/src/middlewares/cookie-jwt.js  (ersätter den gamla)

module.exports = () => {
  // Inställningar för cookien. Samma används vid login, förnyelse och logout
  const cookieOptions = {
    httpOnly: true, // JavaScript i webbläsaren kan inte läsa cookien
    secure: process.env.NODE_ENV === "production", // kräver https i produktion
    sameSite: "strict", // skickas bara från din egen sajt
    maxAge: 60 * 60 * 1000, // 1 timme utan aktivitet = utloggad
  };

  return async (ctx, next) => {
    // Logout: radera cookien
    if (ctx.path === "/api/auth/logout" && ctx.method === "POST") {
      ctx.cookies.set("jwt", null, cookieOptions);
      ctx.body = { ok: true };
      return;
    }

    // Finns en cookie? Gör om den till en Authorization-header.
    // usedCookie kommer ihåg att det var cookien vi använde (inte t.ex. admin-panelen)
    const jwt = ctx.cookies.get("jwt");
    let usedCookie = false;
    if (jwt && !ctx.request.header.authorization) {
      ctx.request.header.authorization = `Bearer ${jwt}`;
      usedCookie = true;
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

    // NYTT: Förnya. Om användaren var inloggad via cookien och anropet gick bra,
    // skapa en ny jwt (gäller 1 timme till) och spara den i cookien
    if (usedCookie && ctx.state.user && ctx.status < 400) {
      const newJwt = strapi
        .plugin("users-permissions")
        .service("jwt")
        .issue({ id: ctx.state.user.id });
      ctx.cookies.set("jwt", newJwt, cookieOptions);
    }
  };
};
