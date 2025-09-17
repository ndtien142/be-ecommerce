const redis = require('redis');

class RedisPubSubService {
    constructor() {
        this.subscriber = redis.createClient();
        this.publisher = redis.createClient();

        // Catch error
        this.subscriber.on('error', console.error);
        this.publisher.on('error', console.error);
    }

    async connect() {
        // Redis v5 need connect manual
        if (!this.publisher.isOpen) await this.publisher.connect();
        if (!this.subscriber.isOpen) await this.subscriber.connect();
    }

    async publish(channel, message) {
        // V5 auto return promise
        return this.publisher.publish(channel, message);
    }

    async subscribe(channel, callback) {
        return await this.subscriber.subscribe(channel, (message) => {
            callback(channel, message);
        });
    }
}

module.exports = new RedisPubSubService();
