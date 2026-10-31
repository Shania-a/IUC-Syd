// Spara som: backend/src/middlewares/cookie-jwt.js

module.exports = () => {
  const cookieOptions = {
    httpOnly: true, // JavaScript i webbläsaren kan inte läsa cookien[cite: 5]
    secure: process.env.NODE_ENV === "production", // kräver https i produktion[cite: 5]
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // "lax" för localhost[cite: 5]
    maxAge: 60 * 60 * 1000, // 1 timme[cite: 5]
  };

  return async (ctx, next) => {
    // Logout: radera cookien[cite: 5]
    if (ctx.path === "/api/auth/logout" && ctx.method === "POST") {
      ctx.cookies.set("jwt", null, cookieOptions);
      ctx.body = { ok: true };
      return;
    }

    // Finns en cookie? Gör om den till en Authorization-header[cite: 5]
    const jwt = ctx.cookies.get("jwt");
    if (jwt && !ctx.request.header.authorization) {
      ctx.request.header.authorization = `Bearer ${jwt}`;
    }

    await next();

    // Login: lägg jwt i cookien och ta bort den ur svaret[cite: 5]
    if (
      ctx.path === "/api/auth/local" &&
      ctx.method === "POST" &&
      ctx.body &&
      ctx.body.jwt
    ) {
      ctx.cookies.set("jwt", ctx.body.jwt, cookieOptions);
      delete ctx.body.jwt;
    }
  };
};
