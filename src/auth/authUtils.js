'use strict';

const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/handleError');
const { HEADER } = require('../common/common.constant');
const KeyTokenService = require('../services/keyToken.service');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { convertToObjectMongodb } = require('../utils');

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days',
        });
        const refreshToken = await jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days',
        });
        // verify token
        jwt.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error('Error verify::', err);
            } else {
                console.log('Decode verify::', decode);
            }
        });
        return { accessToken, refreshToken };
    } catch (error) {
        return error;
    }
};

// Authentication
const authentication = asyncHandler(async (req, res, next) => {
    /**
     * 1 - check user id missing?
     * 2 - get access token
     * 3 - verify token
     * 4 - check user in db
     * 5 - check keyStore with this userId?
     * 6 - ok all -> go next()
     */
    const userId = req.headers[HEADER.USER_ID];
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!userId) throw new AuthFailureError('User ID is missing');
    if (!accessToken) throw new AuthFailureError('Access token is missing');

    const keyStore = await KeyTokenService.findByUserId(
        convertToObjectMongodb(userId),
    );

    if (!keyStore) throw new NotFoundError('Not found keyStore');

    try {
        const decodeUser = jwt.verify(accessToken, keyStore.publicKey);

        if (userId !== decodeUser.userId)
            throw new AuthFailureError('Invalid user');

        req.keyStore = keyStore;
        req.userId = userId;
        return next();
    } catch (error) {
        throw error;
    }
});

module.exports = {
    createTokenPair,
    authentication,
};
