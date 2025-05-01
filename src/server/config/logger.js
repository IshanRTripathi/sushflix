const winston = require('winston');

const { combine, timestamp, json, printf, colorize, simple } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        myFormat,
        json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {    
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            simple(),
        )
    }));
  }

  logger.info = (message) => logger.log('info', `INFO: ${message}`);
  logger.error = (message) => logger.log('error', `ERROR: ${message}`);
  logger.warn = (message) => logger.log('warn', `WARN: ${message}`);
module.exports = logger;