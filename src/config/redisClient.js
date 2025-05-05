const Redis = require('ioredis');
const logger = require('../utils/logger');
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    
});
redisClient.on('connect', ()=>{
    logger.info('Redis connection SUCCESS :)');
});
redisClient.on('error', (err)=>{
    logger.error(`Redis connection FAIL :( ${err.message}`);
});
module.exports = redisClient;