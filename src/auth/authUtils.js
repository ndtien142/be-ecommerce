'use strict';

const jwt = require('jsonwebtoken');

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

module.exports = {
    createTokenPair,
};
