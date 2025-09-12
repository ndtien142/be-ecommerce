'use strict';

const redis = require('redis');
// Transform a function to async/await function
const { promisify } = require('util');
const {
    reservationInventory,
} = require('../models/repositories/inventory.repo');
const redisClient = redis.createClient();

const pExpire = promisify(redisClient.pExpire).bind(redisClient);

const setNXAsync = promisify(redisClient.setNX).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2025_${productId}`;
    const retryTimes = 10;
    const expireTime = 3000; // 3 second lock

    for (let i = 0; i < retryTimes.length; i++) {
        // create a key, who hold key can be order
        const result = await setNXAsync(key, expireTime);

        console.log('Result::', result);

        if (result === 1) {
            // operation with inventory
            const isReservation = await reservationInventory({
                productId,
                cartId,
                quantity,
            });
            if (isReservation.modifiedCount) {
                await pExpire(key, expireTime);
                return key;
            }
            return null;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
};

const releaseLock = async (keyLock) => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient);
    return await delAsyncKey(keyLock);
};

module.exports = {
    acquireLock,
    releaseLock,
};
