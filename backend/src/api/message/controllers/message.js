"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::message.message", () => ({
  // Visa bara meddelanden där du är mottagare
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    ctx.query = {
      filters: { receivers: { documentId: user.documentId } },
      populate: { sender: { fields: ["username"] } },
      sort: ["createdAt:desc"],
    };

    return super.find(ctx);
  },

  // Sätt avsändaren själv, så ingen kan låtsas vara någon annan
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { title, content, receivers } = ctx.request.body.data;

    ctx.request.body.data = {
      title,
      content,
      receivers,
      sender: user.documentId,
    };

    return super.create(ctx);
  },
}));
