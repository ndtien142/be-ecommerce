'use strict';

const keyTokenModel = require('../models/keyToken.model');

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, refreshToken }) => {
        try {
            // level 0
            // const publicKeyString = publicKey.toString();
            // const tokens = await keyTokenModel.create({
            //     user: userId,
            //     publicKey: publicKeyString,
            // });
            // return tokens ? tokens.publicKey : null;

            // level up
            const tokens = await keyTokenModel.findOneAndUpdate(
                {
                    user: userId,
                },
                {
                    refreshTokenUsed: [],
                    publicKey: publicKey.toString(),
                    refreshToken: refreshToken || '',
                },
                {
                    new: true,
                    upsert: true,
                },
            );

            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    };
}

module.exports = KeyTokenService;
