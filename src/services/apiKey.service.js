'use strict';

const apiKeyModel = require('../models/apiKey.model');
const crypto = require('crypto');

const findAPIKeyById = async (key) => {
    // Create new key
    // const newKey = await apiKeyModel.create({
    //     key: crypto.randomBytes(16).toString('hex'),
    //     permissions: ['0000'],
    // });

    const objKey = await apiKeyModel
        .findOne({
            key: key,
            status: true,
        })
        .lean();
    return objKey;
};

module.exports = {
    findAPIKeyById,
};
