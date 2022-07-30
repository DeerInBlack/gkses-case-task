"use strict";

const Joi = require('joi');
const Boom = require('boom');

module.exports = {
    method: 'GET',
    path: '/rate',
    options: {
        tags: ['api'],
        response: {
            schema: Joi.number().example(9000.0000)
        }
    },
    handler: async (request, h) => {
        return (await request.server.methods.getRate())?.price
            || Boom.serverUnavailable("Exchange API not responding.");
    }
};
