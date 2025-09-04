'use strict';

const { findAPIKeyById } = require('../services/apiKey.service');

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
};

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString();

        if (!key) {
            return res.status(403).json({
                code: 403,
                message: 'Forbidden',
            });
        }

        // check object key in database
        const objKey = await findAPIKeyById(key);

        if (!objKey) {
            return res.status(403).json({
                code: 403,
                message: 'Forbidden',
            });
        }

        // add objKey to req
        req.objKey = objKey;
        return next();
    } catch (error) {
        next(error);
    }
};

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                code: 403,
                message: 'Permission denied',
            });
        }

        const hasPermission = req.objKey.permissions.includes(permission);
        console.log('permissions::', req.objKey.permissions);

        if (!hasPermission) {
            return res.status(403).json({
                code: 403,
                message: 'Permission denied',
            });
        }
        return next();
    };
};

module.exports = {
    apiKey,
    permission,
};
