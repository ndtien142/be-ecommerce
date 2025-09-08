'use strict';

const shopModel = require('../models/shop.model');

const findShopByEmail = async ({
    email,
    select = {
        email: 1,
        name: 1,
        roles: 1,
        password: 1,
    },
}) => {
    return await shopModel.findOne({ email }, select).lean();
};

module.exports = {
    findShopByEmail,
};
