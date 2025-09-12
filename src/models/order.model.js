'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders';

// Declare the Schema of the Mongo model
var orderSchema = new Schema(
    {
        order_userId: { type: Number, required: true },
        /*
            order_checkout: {
                totalPrice,
                totalApplyDiscount,
                feeShip,
                totalCheckout
            }
        */
        order_checkout: { type: Object, default: {} },
        /*
            street,
            country,
            city,
            state,...
        */
        order_shipping: { type: Object, default: {} },
        order_payment: { type: Object, default: {} },
        order_products: { type: Array, require: true },
        order_trackingNumber: { type: String, default: '#00000012321' },
        order_status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    },
);

//Export the model.
module.exports = model(DOCUMENT_NAME, orderSchema);
