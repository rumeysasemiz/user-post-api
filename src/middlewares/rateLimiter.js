const redisClient = require('../config/redisClient');
const logger = require('../utils/logger');

// rate lmilteer middleware
const rateLimiter = async (req, res, next) => {
    try {
        const ip= req.ip
        const requestPath= req.path;
        const key= `rate_limit:${ip}:${requestPath}`; // rate limit anahtarı
        const requests= await redisClient.incr(key); // anahtarı 1 artırıyoruz
        if(requests===1){
            await redisClient.expire(key, 60); // 60 saniye sonra anahtarı sil
        }
        // lmilt 60 saniyede 10 isteğe izin veriyoruz
        if(requests>10){
            logger.warn(`Rate limit exceeded for IP: ${ip}, path: ${requestPath}`);

            return res.status(429).json({message:'Too many requests, please try again later'}); // 429 hata kodu döndürüyoruz
        }
        next(); // rate limit aşılmadıysa bir sonraki middleware'e geçiyoruz
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        next(); // hata fırlatıyoruz
        
    }
};
module.exports = rateLimiter; // rate limiter middleware'i dışa aktarıyoruz
