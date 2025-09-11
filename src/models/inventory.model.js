'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Inventory';
const COLLECTION_NAME = 'Inventories';

// Declare the Schema of the Mongo model
var inventorySchema = new Schema(
    {
        inventory_productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        inventory_location: { type: String, default: 'unknown' },
        inventory_stock: { type: Number, required: true },
        inventory_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
        // Reservation
        /**
         * cartId: ...,
         * stock: 1,
         * createOn:....
         */
        inventory_reservations: { type: Array, default: [] },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    },
);

//Export the model
module.exports = model(DOCUMENT_NAME, inventorySchema);
