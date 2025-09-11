'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const { Types } = require('mongoose');

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

const removeUndefinedObject = (obj) => {
    for (const key in obj) {
        if (obj[key] === null || typeof obj[key] === 'undefined') {
            delete obj[key];
        } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            cleanObject(obj[key]); // Recursively clean nested objects
        }
    }
    return obj;
};

const convertToObjectMongodb = (id) => new Types.ObjectId(id);

module.exports = {
    getInfoData,
    generateKeyPairSync,
    getSelectData,
    unSelectData,
    removeUndefinedObject,
    convertToObjectMongodb,
};
