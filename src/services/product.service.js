'use strict';

const { BadRequestError } = require('../core/error.response');
const { clothing, electronics, product } = require('../models/product.model');

// define the Factory Method class to create products based on their type
class ProductFactory {
    /**
     *
     * @param {*} type
     *
     */
    static async createProduct(type, payload) {
        switch (type) {
            case 'Clothing':
                return new Clothing(payload).createProduct();
            case 'Electronic':
                return new Electronics(payload).createProduct();
            default:
                throw new BadRequestError(`Invalid product type: ${type}`);
        }
    }
}

// define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes,
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    // Create new product
    async createProduct(productId) {
        return await product.create({ ...this, _id: productId });
    }
}

// Define sub-class for different product types Clothing

class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newClothing)
            throw new BadRequestError('Create new clothing error');
        const newProduct = await super.createProduct(newClothing._id);

        if (!newProduct) {
            await clothing.deleteOne({ _id: newClothing._id });
            throw new BadRequestError('Create new product error');
        }
        return newProduct;
    }
}

// Define sub-class for different product types Electronics

class Electronics extends Product {
    async createProduct() {
        const newElectronics = await electronics.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newElectronics)
            throw new BadRequestError('Create new electronics error');
        const newProduct = await super.createProduct(newElectronics._id);

        if (!newProduct) {
            await electronics.deleteOne({ _id: newElectronics._id });
            throw new BadRequestError('Create new product error');
        }
        return newProduct;
    }
}

module.exports = ProductFactory;
