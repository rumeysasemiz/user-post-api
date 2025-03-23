const express = require("express"); //http isteklerini yönetmek için 
const mongoose = require("mongoose"); //mongodb bağlantısı için
const cors = require("cors"); //farklı domainlerden gelen istekleri kabul etmek için
const helmet = require("helmet"); //güvenlik için
const morgan = require("morgan"); //loglama için
const userRoutes = require('./routes/userRoutes');
const postRoutes= require('./routes/postRoutes');
const connectDB = require('./config/db');
require("dotenv").config(); //env dosyasını okumak için
const app = express(); //uygulamayı oluşturmak için
app.use(express.json()); //json verileri almak için

app.use(cors()); //cors middleware 
connectDB(); //mongodb bağlantısı

app.get("/", (req, res) => {
    res.send("Server is running");
});
app.get("/api", (req, res) => {
    res.send("API is running");
});
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
const port = process.env.PORT || 3000; //port numarası
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});