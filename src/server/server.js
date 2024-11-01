const path = require('path');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const logger = require('./config/logger');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');

// Load environment variables from .env file located in the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(morgan('dev'));
app.use('/api', authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => logger.info('MongoDB connected'))
    .catch((err) => {
        console.log('MONGODB_URI:', process.env.MONGODB_URI);
        logger.error('MongoDB connection error:', err);
    });

// File related operations
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// This route would serve the image files stored in GridFS
app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ err: 'No file exists' });
        }
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Error handling
app.use(errorHandler);

// Performance monitoring middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Request to ${req.method} ${req.path} took ${duration}ms`);
    });
    next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

module.exports = app;