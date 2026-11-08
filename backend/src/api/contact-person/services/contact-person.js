'use strict';

/**
 * contact-person service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::contact-person.contact-person');
