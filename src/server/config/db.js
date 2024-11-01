const mongoose = require('mongoose');
const logger = require('./logger');
require('dotenv').config({ path: '../../.env' });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        logger.error(`MongoDB connection error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;