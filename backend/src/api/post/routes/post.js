'use strict';

/**
 * Routes för communityt: inlägg och kommentarer.
 *
 * De kräver inloggning. Rollerna Authenticated och admin måste få behörighet
 * till find, create och createComment under Post i Strapi
 * (Settings > Users & Permissions > Roles).
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/posts',
      handler: 'post.find',
      config: { policies: [] },
    },
    {
      method: 'POST',
      path: '/posts',
      handler: 'post.create',
      config: { policies: [] },
    },
    {
      method: 'POST',
      path: '/posts/:documentId/comments',
      handler: 'post.createComment',
      config: { policies: [] },
    },
  ],
};