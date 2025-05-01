const express = require('express');
const Subscription = require('../models/Subscription');
const auth = require('../middlewares/auth');
const logger = require('../config/logger');
const router = express.Router();

// Create subscription
router.post('/', auth(), async (req, res) => {
  logger.info('POST /api/subscriptions route handler executed');
  try {
    const subscription = new Subscription({
      subscriber: req.user.userId,
      ...req.body,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });    
      await subscription.save();
    
    logger.info(`Subscription created: ${subscription._id}`);
    res.status(201).json(subscription);
  } catch (err) {
      logger.error(`Subscription creation error: ${err.message}`);
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).json({ message: err.message });
    }
    if(err.code === 11000){
        return res.status(409).json({message: "Subscription already exists"})
    }
    return res.status(500).json({ message: "Server Error" });

    res.status(400).json({ message: err.message });
  }
});

// Get user's subscriptions
router.get('/my', auth(), async (req, res) => {
  logger.info('GET /api/subscriptions/my route handler executed');
  try {
    const subscriptions = await Subscription.find({ 
      subscriber: req.user.userId,
      status: 'active'
    }).populate('creator', 'username name');
    
    res.json(subscriptions);
  } catch (err) {
    logger.error(`Subscription fetch error: ${err.message}`);
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).json({ message: "Validation error" });
    }
    res.status(500).json({ message: err.message });
  }
});

// Get creator's subscribers
router.get('/subscribers', auth(['creator']), async (req, res) => {
  logger.info('GET /api/subscriptions/subscribers route handler executed');
  try {
    const subscriptions = await Subscription.find({ 
      creator: req.user.userId,
      status: 'active'
    }).populate('subscriber', 'username name');
    
    res.json(subscriptions);
  } catch (err) {
    logger.error(`Subscribers fetch error: ${err.message}`);
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).json({ message: "Validation error" });
    }
    res.status(500).json({ message: err.message });
  }
});

// Cancel subscription
router.patch('/:id/cancel', auth(), async (req, res) => {
  logger.info('PATCH /api/subscriptions/:id/cancel route handler executed');
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      subscriber: req.user.userId,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();
    
    logger.info(`Subscription cancelled: ${subscription._id}`);
    res.json(subscription);
  } catch (err) {
    logger.error(`Subscription cancellation error: ${err.message}`);
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).json({ message: "Validation error" });
    }
    if (err.name === 'CastError') {
        return res.status(404).json({ message: 'Subscription not found' }); 
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;