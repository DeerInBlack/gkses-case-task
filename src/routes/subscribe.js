"use strict";

const Joi = require('joi');
const Boom = require('boom');

module.exports = {
    method: 'POST',
    path: '/subscribe',
    options: {
        tags: ['api'],
        payload: { multipart: true },
        validate: {
            payload: Joi.object({
                email: Joi.string().email({ tlds: false }).required().example('ex@example.com')
            })
        },
        plugins: { 'hapi-swagger': { payloadType: 'form' } },
    },
    handler: async (request, h) => {
        const email = request.payload.email;
        const addEmailRes = await request.server.methods.addEmail(email);
        return addEmailRes ? h.response({
            result: "OK",
            message: "Email was added to the mailing list"
        }) : Boom.conflict("Email is already in the mailing list");
    }
};
