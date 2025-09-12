'use strict';

const { convertToObjectMongodb } = require('../../utils');
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

const reservationInventory = async ({ productId, quantity, cartId }) => {
    const query = {
        inventory_productId: convertToObjectMongodb(productId),
        inventory_stock: { $gte: quantity },
    };
    const updateSet = {
        $inc: {
            inventory_stock: -quantity,
        },
        $push: {
            inventory_reservations: {
                quantity,
                cartId,
                createOn: new Date(),
            },
        },
    };
    const option = {
        upsert: true,
        new: true,
    };

    return await inventoryModel.updateMany(query, updateSet, option);
};

module.exports = {
    insertInventory,
    reservationInventory,
};
