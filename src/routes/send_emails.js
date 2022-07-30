"use strict";

const Joi = require('joi');
const Handlebars = require('hbs');
const fs = require('fs');
const path = require('path');

const emailTemplateSource = fs.readFileSync(
    path.resolve(__dirname, '../misc/email_template.hbs'), 'utf-8');
const emailTemplate = Handlebars.compile(emailTemplateSource);

module.exports = {
    method: 'POST',
    path: '/sendEmails',
    options: {
        tags: ['api'],
        response: {
            schema: Joi.object({
                unsentEmails: Joi.array().items(
                    Joi.string().email().example('ex@example.com')
                )
            })
        }
    },
    handler: async (request, h) => {
        const rate = await request.server.methods.getRate();
        
        const emailHtml = emailTemplate(rate);

        const emailData = {
            title: 'Exchange rate',
            text: `Rate(${rate.symbol}): ${rate.symbol}`,
            html: emailHtml
        };

        const unsentList = await request.server.methods.sendEmailList(emailData);

        return h.response({
            unsentEmails: unsentList
        });
    }
};
