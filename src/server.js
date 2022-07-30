"use strict";

const Hapi = require('@hapi/hapi');
const HapiSwagger = require('hapi-swagger');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');

const Package = require('../package');
const config = require('../config');
const routes = require('./routes');

const swaggerOptions = {
    info: {
      title: Package.name + ' API',
      description: Package.description
    },
    jsonPath: '/documentation.json',
    documentationPath: '/documentation',
    schemes: ['https', 'http'],
    host: config.swaggerHost,
    debug: true
  }

async function runServer() {
    const server = Hapi.server(config.server);

    await server.register([
        Vision,
        Inert,
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        },
        {
            plugin: require('./plugins/mailing_list'),
            options: {
                emailsPath: config.emailsPath,
                transportOptions: config.mailTransportOptions
            }
        },
        {
            plugin: require('./plugins/exchange'),
            options: { defaultSymbol: config.defaultSymbol }
        }
    ]);

    server.route(routes);

    try {
        await server.start();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }

    console.log('Server running at: ', server.info.uri);
    return server;
}

runServer();
