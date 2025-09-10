'use strict';

const { extend } = require('lodash');
const { BadRequestError } = require('../core/error.response');
const {
    clothing,
    electronics,
    product,
    furniture,
} = require('../models/product.model');
const {
    publishProductShop,
    queryProduct,
    unpublishProductShop,
    searchProductByUser,
    findAllProductByUser,
    findOneProduct,
    updateProductById,
} = require('../models/repositories/product.repo');

// define the Factory Method class to create products based on their type
class ProductFactory {
    /**
     *
     * @param {*} type
     *
     */
    // static async createProduct(type, payload) {
    //     switch (type) {
    //         case 'Clothing':
    //             return new Clothing(payload).createProduct();
    //         case 'Electronic':
    //             return new Electronics(payload).createProduct();
    //         default:
    //             throw new BadRequestError(`Invalid product type: ${type}`);
    //     }
    // }

    // Apply Strategy Pattern
    // Contain key - class
    static productRegistry = {};

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];

        if (!productClass)
            throw new BadRequestError(`Invalid product type: ${type}`);

        return new productClass(payload).createProduct();
    }

    static async updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type];

        if (!productClass)
            throw new BadRequestError(`Invalid product type: ${type}`);

        return new productClass(payload).updateProduct(productId);
    }

    // Query
    static async findAllDraftsForShop({ product_shop, limit = 60, skip = 0 }) {
        const query = { product_shop, isDraft: true };
        return await queryProduct({ query, limit, skip });
    }

    static async findAllPublishProduct({ product_shop, limit = 60, skip = 0 }) {
        const query = { product_shop, isPublish: true };
        return await queryProduct({ query, limit, skip });
    }

    static async searchProduct({ searchText }) {
        return await searchProductByUser({ searchText });
    }

    static async findAllProduct({
        limit = 50,
        sort = 'ctime',
        page = 1,
        filter = { isPublish: true },
    }) {
        return await findAllProductByUser({
            filter,
            limit,
            sort,
            page,
            select: ['product_name', 'product_price', 'product_thumb'],
        });
    }

    static async findProduct({ product_id }) {
        return await findOneProduct({ product_id, unSelect: ['__v'] });
    }

    // PUT
    static async publicProductByShop({ product_shop, product_id }) {
        const value = await publishProductShop({
            product_shop,
            product_id,
        });
        if (value === null) throw new BadRequestError('Product Not Found');
        return value;
    }

    static async unpublishProductByShop({ product_shop, product_id }) {
        const value = await unpublishProductShop({
            product_id,
            product_shop,
        });
        if (value === null) throw new BadRequestError('Product Not Found');
        return value;
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

    // Update product
    async updateProduct(productId, payload) {
        return await updateProductById({ productId, payload, model: product });
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

    async updateProduct(productId) {
        console.log('prodcutId', productId);
        // 1. remove attribute null or undefined
        const objectParams = this;
        // 2. where update
        if (objectParams.product_attributes) {
            // update child
            await updateProductById({
                productId,
                model: clothing,
                payload: objectParams.product_attributes,
            });
        }

        const updateProduct = await super.updateProduct(
            productId,
            objectParams,
        );

        return updateProduct;
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

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newFurniture)
            throw new BadRequestError('Create new furniture error');

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('Create new product error');

        return newProduct;
    }
}

// Register product type
ProductFactory.registerProductType('Electronic', Electronics);
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory;
