'use strict';

const Logger = require('../logger/discord.log.v2');

const pushCodeFormatToLogDiscord = async (req, res, next) => {
    try {
        Logger.sendToFormatCode({
            title: `Method: ${req.method}`,
            code: req.method === 'GET' ? req.query : req.body,
            body: `${req.get('host')} ${req.originalUrl}`,
        });
        return next();
    } catch (err) {
        next(err);
    }
};

const pushSimpleMessage = async (req, res, next) => {
    try {
        Logger.sendToMessage(req.get('host'));
        return next();
    } catch (e) {
        next(e);
    }
};

module.exports = {
    pushCodeFormatToLogDiscord,
    pushSimpleMessage,
};
