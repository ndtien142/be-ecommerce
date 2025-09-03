'use strict';

const mongoose = require('mongoose');
const os = require('os');
const process = require('process');
const _SECONDS = 5000;

// Count connections
const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections: ${numConnection}`);
};

// Check over load
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        // Check if the number of connections is greater than the number of cores
        const numCores = os.cpus().length;
        // Calculate memory usage
        const memoryUsage = process.memoryUsage().rss;

        console.log(`Current memory usage: ${memoryUsage / 1024 / 1024} MB`);
        console.log(`Number of CPU cores: ${numCores}`);
        console.log('Current connections:', numConnection);

        // Example maximum number of connection based on number of cores
        const maxConnections = numCores * 5;
        if (numConnection > maxConnections) {
            console.warn(
                `High number of connections: ${numConnection}. Maximum allowed: ${maxConnections}`,
            );
            console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);
        }
    }, _SECONDS);
};

module.exports = {
    countConnect,
    checkOverload,
};
