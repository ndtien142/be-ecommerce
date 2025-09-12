'use strict';

const InventoryService = require('../services/inventory.service');

class InventoryController {
    addStockInventory = async (req, res, next) => {
        new SuccessResponse({
            message: 'Add stock inventory success!',
            metadata: await InventoryService.addStockToInventory(req.body),
        }).send(res);
    };
}

module.exports = new InventoryController();
