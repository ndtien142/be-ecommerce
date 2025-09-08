'use strict';

const _ = require('lodash');
const crypto = require('crypto');

const getInfoData = ({ field = [], object = {} }) => {
    return _.pick(object, field);
};

const generateKeyPairSync = async ({ algorithm = 'rsa' }) => {
    const { privateKey, publicKey } = await crypto.generateKeyPairSync(
        algorithm,
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
    return { privateKey, publicKey };
};

module.exports = {
    getInfoData,
    generateKeyPairSync,
};
