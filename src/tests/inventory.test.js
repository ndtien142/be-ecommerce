const redisPublishSubscribeService = require('../services/redisPubSub.service');

class InventoryServiceTest {
    constructor() {
        // ensure redis connect
        redisPublishSubscribeService.subscribe(
            'purchase_events',
            (channel, message) => {
                try {
                    const { productId, quantity } = JSON.parse(message);
                    InventoryServiceTest.updateInventory(productId, quantity);
                } catch (err) {
                    console.error('Invalid message format:', message, err);
                }
            },
        );
    }

    static updateInventory(productId, quantity) {
        console.log(`Updated inventory ${productId} with quantity ${quantity}`);
    }
}

module.exports = new InventoryServiceTest();
