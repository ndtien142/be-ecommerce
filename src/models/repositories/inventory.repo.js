'use strict';

const inventoryModel = require('../inventory.model');

const insertInventory = async ({
    productId,
    shopId,
    stock,
    location = 'unknown',
}) => {
    return await inventoryModel.create({
        inventory_productId: productId,
        inventory_shopId: shopId,
        inventory_stock: stock,
        inventory_location: location,
    });
};

module.exports = {
    insertInventory,
};
