const logger = require('../utils/logger'); 

const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
        });
        logger.info("MongoDB connection SUCCESS :)");
    } catch (error) {
        logger.error(`MongoDB connection FAIL :( ${error.message}`);
        process.exit(1);
    }
};
module.exports = connectDB;