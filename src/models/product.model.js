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
                'Electronic',
                'Clothing',
                'Furniture',
                'Toys',
                'Books',
                'Other',
            ],
        },
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
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
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
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
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    },
    {
        collection: ProductCollectionName.ELECTRONICS,
        timestamps: true,
    },
);

const furnitureSchema = new Schema(
    {
        brand: { type: String, required: true },
        model: String,
        color: String,
        product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    },
    {
        collection: ProductCollectionName.FURNITURE,
        timestamps: true,
    },
);

module.exports = {
    product: model(ProductDocumentName.PRODUCT, productSchema),
    clothing: model(ProductDocumentName.CLOTHING, clothingSchema),
    electronics: model(ProductDocumentName.ELECTRONICS, electronicsSchema),
    furniture: model(ProductDocumentName.FURNITURE, furnitureSchema),
};
