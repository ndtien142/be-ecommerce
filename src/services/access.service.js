'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError } = require('../core/error.response');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
};

class AccessService {
    static signUp = async ({ name, email, password }) => {
        // Logic for signing up the user
        // Step 1: check email existed?
        const existingShop = await shopModel
            .findOne({
                email,
            })
            .lean();
        // lean converts the document to a plain JavaScript object
        if (existingShop) {
            throw new BadRequestError('Error: Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        });

        if (newShop) {
            // created private key, publicKey
            const { privateKey, publicKey } = await crypto.generateKeyPairSync(
                'rsa',
                {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                },
            );

            const publicKeyString = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
            });

            if (!publicKeyString) {
                throw new BadRequestError('Error: KeyTokenService error');
            }

            const publicKeyObject = crypto.createPublicKey(publicKeyString);

            // Step 3: create token pair
            // Create token pair
            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKeyObject,
                privateKey,
            );

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({
                        field: ['_id', 'name', 'email'],
                        object: newShop,
                    }),
                    tokens,
                },
            };
        }

        return {
            code: 200,
            metadata: null,
        };
    };
}

module.exports = AccessService;
