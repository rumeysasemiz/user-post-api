const express = require("express"); //http isteklerini yönetmek için 
const mongoose = require("mongoose"); //mongodb bağlantısı için
const cors = require("cors"); //farklı domainlerden gelen istekleri kabul etmek için
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const session = require('express-session'); //session yönetimi için
const logger = require('./utils/logger');
const redisClient = require('./config/redisClient'); //redis bağlantısı için
const connectDB = require('./config/db');
// Eski versiyonda farklı import kullanımı
const RedisStore = require('connect-redis')(session);
const rateLimiter = require('./middlewares/rateLimiter'); //rate limiter middleware
require("dotenv").config(); //env dosyasını okumak için



const app = express(); //uygulamayı oluşturmak için
app.use(express.json()); //json verileri almak için
// Redis bağlantısını test et
redisClient.set('test', 'Redis bağlantısı çalışıyor!').then(() => {
    redisClient.get('test').then(result => {
        logger.info(`Redis test: ${result}`);
    });
});




  app.use(session({
    store: new RedisStore({ client: redisClient }), // Redis store kullanıyoruz
    secret: process.env.SESSION_SECRET || 'keyboard_cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 gün
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  }));

app.use(rateLimiter); // rate limiter middleware'i kullanıyoruz
app.use(cors({
    origin : process.env.CORS_ORIGIN || '*', //cors konfigrüasyonu
    credentials: true, //session cookie'lerini paylaşmak için
})); //cors middleware 
connectDB(); //mongodb bağlantısı
// Basit loglama middleware
app.use((req, res, next) => {
    // istewğin oturum detaylarını loglama 
    if(req.session && req.session.userId){
        logger.info(`Authenticated request from user ${req.session.userId}: ${req.method} ${req.url}`);
    }else{
        logger.info(`Unauthenticated request: ${req.method} ${req.url}`);
    }
    next();
});
app.get("/", (req, res) => {
    res.send("Server is  running ");
});
app.get("/api", (req, res) => {
    res.send("API is running");
});
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
// Hata işleme middleware
app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
});
const port = process.env.PORT || 3000; //port numarası
app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});