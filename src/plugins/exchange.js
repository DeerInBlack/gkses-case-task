"use strict";

const axios = require('axios');

async function getRate(symbol) {
    symbol = typeof symbol === 'string' ? symbol : this.defaultSymbol;
    
    try {
        const res = await axios
            .get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        return res.data;
    } catch (err) {

        // Error codes sent on IP ban 
        if (err.response.status in [429, 418]) throw Error("Exchange API ban");
    }
}

module.exports.plugin = {
    name: 'exchangePlugin',
    version: '0.8.0',
    register: async function (server, options) {
        
        // caching prevents excessive Binance API calls and reduces overhead
        // neglecting Binance restrictions (~1200 calls per minute for this method but
        //  it's twice smaller for invalid symbol) will lead to IP ban
        server.method('getRate', getRate, {
            bind: { defaultSymbol: options.defaultSymbol },
            cache: {
                expiresIn: 5000,
                staleIn: 200,
                staleTimeout: 100,
                generateTimeout: 7000  // beware of generateTimeout
            }
        });
    }
};