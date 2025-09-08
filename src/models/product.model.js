'use strict';

const { model, Schema } = require('mongoose');
const {
    ProductCollectionName,
    ProductDocumentName,
} = require('../common/common.constant');

const productSchema = new Schema(
    {
        product_name: { type: String, required: true, unique: true },
        product_thumb: { type: String, required: true },
        product_description: { type: String },
        product_price: { type: Number, required: true },
        product_quantity: { type: Number, required: true },
        product_type: {
            type: String,
            required: true,
            enum: [
                'Electronics',
                'Clothes',
                'Furniture',
                'Toys',
                'Books',
                'Other',
            ],
        },
        product_shop: String,
        product_attributes: { type: Schema.Types.Mixed, required: true },
    },
    {
        collection: ProductCollectionName.PRODUCT,
        timestamps: true,
    },
);

// define the product type = electronics

const clothingSchema = new Schema(
    {
        brand: { type: String, required: true },
        size: String,
        material: String,
    },
    {
        collection: ProductCollectionName.CLOTHING,
        timestamps: true,
    },
);

const electronicsSchema = new Schema(
    {
        brand: { type: String, required: true },
        model: String,
        color: String,
        warranty_period: String,
    },
    {
        collection: ProductCollectionName.ELECTRONICS,
        timestamps: true,
    },
);

model.exports = {
    product: model(ProductDocumentName.PRODUCT, productSchema),
    clothing: model(ProductDocumentName.CLOTHING, clothingSchema),
    electronics: model(ProductDocumentName.ELECTRONICS, electronicsSchema),
};
