const morgan = require('morgan');
const logger = require('../config/logger');

const requestLogger = morgan('combined', {
    stream: {
        write: (message) => {
            // Log that a new request has been received
            logger.info('New request received');

            logger.info(message.trim());
        }
    }
});

module.exports = requestLogger;