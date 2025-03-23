const express = require("express"); //http isteklerini yönetmek için 
const mongoose = require("mongoose"); //mongodb bağlantısı için
const cors = require("cors"); //farklı domainlerden gelen istekleri kabul etmek için
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const logger = require('./utils/logger');

const connectDB = require('./config/db');
require("dotenv").config(); //env dosyasını okumak için
const app = express(); //uygulamayı oluşturmak için
app.use(express.json()); //json verileri almak için

app.use(cors()); //cors middleware 
connectDB(); //mongodb bağlantısı
// Basit loglama middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
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