'use strict';

/**
 * @param {{ strapi: any }} context
 */
module.exports = ({ strapi }) => ({
  /**
   * @param {Array<Record<string, any>>} articles
   * @param {string[]} keywords
   * @param {'any' | 'all'} mode
   */
  processNews(articles = [], keywords = [], mode = 'any') {
    const terms = keywords
      .filter((word) => typeof word === 'string')
      .map((word) => word.trim().toLowerCase())
      .filter(Boolean);

    return articles.map((article, index) => {
      const tags = Array.isArray(article.tags)
        ? article.tags
        : [];

      const text = [
        article.title,
        article.description,
        article.content,
        ...tags,
      ]
        .filter((value) => typeof value === 'string')
        .join(' ')
        .toLowerCase();

      const matches = terms.filter((term) =>
        text.includes(term)
      );

      const matched =
        terms.length === 0 ||
        (mode === 'all'
          ? matches.length === terms.length
          : matches.length > 0);

      return {
        ...article,
        id: article.id ?? `test-${index + 1}`,
        ungapped: {
          matched,
          score: matches.length,
          matches,
          totalKeywords: terms.length,
        },
      };
    });
  },
});
