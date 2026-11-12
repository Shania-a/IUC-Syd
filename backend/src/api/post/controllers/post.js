'use strict';

/**
 * Controller för communityt: inlägg och kommentarer.
 *
 * Författaren sätts alltid från den inloggade användaren, aldrig från något
 * som skickas i anropet. Då kan ingen publicera i någon annans namn.
 */

const POST = 'api::post.post';
const COMMENT = 'api::comment.comment';
const MAX_POST_LENGTH = 2000;
const MAX_COMMENT_LENGTH = 1000;
const MAX_POSTS_PER_REQUEST = 50;

// Samma rollnamn som Log_in.jsx använder för att känna igen IUC Syds konton.
const IUC_ROLE_NAME = 'admin';

// Bara namn, företag och roll följer med i svaret. E-post och andra uppgifter
// om författaren ska inte lämna servern.
const AUTHOR = {
  fields: ['username', 'company_id'],
  populate: { role: { fields: ['name'] } },
};

module.exports = ({ strapi }) => ({
  /**
   * GET /api/posts
   * Svarar med { posts }, de senaste inläggen med nyast först.
   * Varje inlägg har sina kommentarer med äldst först.
   */
  async find(ctx) {
    if (!ctx.state.user) {
      return ctx.unauthorized('Logga in för att läsa communityt.');
    }

    const posts = await strapi.documents(POST).findMany({
      sort: [{ createdAt: 'desc' }],
      limit: MAX_POSTS_PER_REQUEST,
      populate: {
        author: AUTHOR,
        comments: { sort: [{ createdAt: 'asc' }], populate: { author: AUTHOR } },
      },
    });

    ctx.body = { posts: posts.map(toPostResponse) };
  },

  /**
   * POST /api/posts
   * Tar emot { content, postType, topic }. Svarar 201 med { post }.
   */
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Logga in för att publicera i communityt.');
    }

    const { draft, problem } = readPostDraft(strapi, ctx.request.body);
    if (problem) return ctx.badRequest(problem);

    const created = await strapi.documents(POST).create({
      data: { ...draft, author: user.documentId },
      populate: { author: AUTHOR },
    });

    ctx.status = 201;
    ctx.body = { post: toPostResponse(created) };
  },

  /**
   * POST /api/posts/:documentId/comments
   * Tar emot { content }. Svarar 201 med { comment }.
   */
  async createComment(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Logga in för att kommentera.');
    }

    const { content, problem } = readText(ctx.request.body?.content, {
      maxLength: MAX_COMMENT_LENGTH,
      emptyProblem: 'Skriv något i kommentaren innan du skickar.',
      tooLongProblem: 'Kommentaren är för lång.',
    });
    if (problem) return ctx.badRequest(problem);

    const post = await strapi.documents(POST).findOne({ documentId: ctx.params.documentId });
    if (!post) {
      return ctx.notFound('Inlägget finns inte längre. Ladda om sidan.');
    }

    const created = await strapi.documents(COMMENT).create({
      data: { content, post: post.documentId, author: user.documentId },
      populate: { author: AUTHOR },
    });

    ctx.status = 201;
    ctx.body = { comment: toCommentResponse(created) };
  },
});

/**
 * Läser och kontrollerar ett inlägg från anropet.
 * Returnerar { draft } eller { problem } med ett meddelande till användaren.
 */
function readPostDraft(strapi, body) {
  const { content, problem } = readText(body?.content, {
    maxLength: MAX_POST_LENGTH,
    emptyProblem: 'Skriv något i inlägget innan du publicerar.',
    tooLongProblem: 'Inlägget är för långt.',
  });
  if (problem) return { problem };

  // De tillåtna värdena läses från schema.json så att listan bara finns på ett ställe i backend.
  const { postType, topic } = strapi.contentType(POST).attributes;
  if (!postType.enum.includes(body?.postType)) {
    return { problem: 'Välj vilken typ av inlägg det är.' };
  }
  if (!topic.enum.includes(body?.topic)) {
    return { problem: 'Välj ett ämne för inlägget.' };
  }

  return { draft: { content, postType: body.postType, topic: body.topic } };
}

/**
 * Läser en text från anropet och tar bort blanktecken i början och slutet.
 * Returnerar { content } eller { problem } med ett meddelande till användaren.
 */
function readText(value, { maxLength, emptyProblem, tooLongProblem }) {
  const content = typeof value === 'string' ? value.trim() : '';
  if (!content) return { problem: emptyProblem };
  if (content.length > maxLength) {
    return { problem: `${tooLongProblem} Max ${maxLength} tecken, det här är ${content.length}.` };
  }
  return { content };
}

function toPostResponse(post) {
  return {
    documentId: post.documentId,
    content: post.content,
    postType: post.postType,
    topic: post.topic,
    createdAt: post.createdAt,
    ...toAuthorResponse(post.author),
    comments: (post.comments ?? []).map(toCommentResponse),
  };
}

function toCommentResponse(comment) {
  return {
    documentId: comment.documentId,
    content: comment.content,
    createdAt: comment.createdAt,
    ...toAuthorResponse(comment.author),
  };
}

function toAuthorResponse(author) {
  return {
    authorName: author?.username ?? 'Borttagen användare',
    // company_id på användaren innehåller företagets namn. Det är så Sign_up.jsx sparar det.
    companyName: author?.company_id ?? '',
    isFromIucSyd: author?.role?.name === IUC_ROLE_NAME,
  };
}