'use strict';

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData, generateKeyPairSync } = require('../utils');
const { BadRequestError } = require('../core/error.response');
const { findShopByEmail } = require('./shop.service');
const { RoleShop } = require('../common/common.constant');

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
            const { privateKey, publicKey } = await generateKeyPairSync();

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
    static login = async ({ email, password, refreshToken = null }) => {
        // Step 1: check email existed?
        const existingShop = await findShopByEmail({ email });
        if (!existingShop) {
            throw new BadRequestError('Shop not registered');
        }
        // Step 2: check password
        const match = await bcrypt.compare(password, existingShop.password);
        if (!match) {
            throw new BadRequestError('Password is incorrect');
        }
        // Step 2: create publicKey, privateKey
        const { privateKey, publicKey } = await generateKeyPairSync({
            algorithm: 'rsa',
        });

        const publicKeyString = await KeyTokenService.createKeyToken({
            userId: existingShop._id,
            publicKey,
            refreshToken,
        });

        if (!publicKeyString) {
            throw new BadRequestError('Error: KeyTokenService error');
        }

        const publicKeyObject = crypto.createPublicKey(publicKeyString);
        // Step 3: create token pair
        const tokens = await createTokenPair(
            { userId: existingShop._id, email },
            publicKeyObject,
            privateKey,
        );

        return {
            code: 200,
            metadata: {
                shop: getInfoData({
                    field: ['_id', 'name', 'email'],
                    object: existingShop,
                }),
                tokens,
            },
        };
    };
    static logout = async ({ keyStore }) => {
        // remove refreshToken in db
        const removeToken = await KeyTokenService.removeKeyById(keyStore._id);
        console.log('removeToken::', removeToken);
        return removeToken;
    };
}

module.exports = AccessService;
