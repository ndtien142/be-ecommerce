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

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map((el) => [el, 1]));
};

const unSelectData = (unSelect = []) => {
    return Object.fromEntries(unSelect.map((el) => [el, 0]));
};

module.exports = {
    getInfoData,
    generateKeyPairSync,
    getSelectData,
    unSelectData,
};
