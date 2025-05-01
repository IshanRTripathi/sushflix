// middlewares/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const logger = require('../config/logger');

const auth = (roles = []) => {
  return (req, res, next) => {
    logger.info('Auth middleware executed');

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (roles.length > 0 && !roles.some(role => req.user.roles.includes(role))) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

module.exports = auth;