'use strict';

const { BadRequestError } = require('../core/error.response');
const inventoryModel = require('../models/inventory.model');
const { findOneProduct } = require('../models/repositories/product.repo');

class InventoryService {
    static async addStockToInventory({
        stock,
        productId,
        shopId,
        location = 'test location',
    }) {
        const product = await findOneProduct({ product_id: productId });
        if (!product) throw new BadRequestError('The product does not exist!');

        const query = {
            inventory_shopId: shopId,
            inventory_productId: productId,
        };
        const updateSet = {
            $inc: {
                inventory_stock: stock,
            },
            $set: {
                inventory_location: location,
            },
        };
        const options = { upsert: true, new: true };

        return await inventoryModel.findOneAndUpdate(query, updateSet, options);
    }
}

module.exports = InventoryService;
