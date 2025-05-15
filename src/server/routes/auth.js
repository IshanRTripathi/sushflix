// routes/auth.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const auth = require('../middlewares/auth');
const devLogin = require('../devLogin');
require('dotenv').config();

const router = express.Router();

router.post('/signup', [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters'),
    body('email')
        .isEmail()
        .withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one capital letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
], async (req, res, next) => { // Added next here
    logger.info(`Executing route: POST /api/signup`); // Corrected log path
    logger.info(`Received registration request body: ${JSON.stringify(req.body)}`); // Log the full body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Validation errors in registration: ${JSON.stringify(errors.array())}`);
        return res.status(400).json({ errors: errors.array() });
    }
    logger.info('Signup validation successful');

    const { username, email, password, isCreator } = req.body;

    logger.info(`Checking if email already exists: ${email}`);
    try {
        // Check if the user already exists by email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          logger.warn(`Attempt to register with existing email: ${email}`);
          return res.status(409).json({ message: 'Email already exists' });
        }
        logger.info('Email available');

        //check if the username already exists
        logger.info(`Checking if username already exists: ${username}`);
        const userExists = await User.findOne({ username });
        if (userExists) {
            logger.warn(`Attempt to register with existing username: ${username}`);
            return res.status(409).json({ message: 'Username already exists' });
        }
        logger.info('Username available');

        // Create a new user with plain password - the pre-save hook will hash it
        logger.info('Creating new user instance');
        const newUser = new User({
          username,
          email,
          password, // Will be hashed by the pre-save hook
          isCreator: isCreator ?? false
        });
        
        // The password will be hashed by the pre-save hook in the User model
        logger.info(`Attempting to save new user to DB: ${newUser.username}`);

        await newUser.save();
        logger.info(`User registered successfully and saved to DB: ${newUser.username}`);
        // Log the user object sent in the response (excluding password)
        const newUserResponse = newUser.toObject();
        delete newUserResponse.password;
        logger.info(`Sending success response for signup: ${JSON.stringify(newUserResponse)}`);
        res.status(201).json({ newUser: newUserResponse });

    } catch (err) {
        logger.error(`Error during signup process for email ${email}: ${err.message}`);
        if(err.code === 11000) { // Duplicate key error
             if (err.keyPattern && err.keyPattern.email) {
                return res.status(409).json({ message: 'Email already exists' });
            } else if (err.keyPattern && err.keyPattern.username) {
                 return res.status(409).json({ message: 'Username already exists' });
            } else {
                 return res.status(500).json({ message: 'Duplicate key error' });
            }
        } else {
            next(err);
        }

    }
});

router.get('/me', auth(), async (req, res) => { // Applying auth middleware
    logger.info(`Executing route: GET /api/me`); // Corrected log path
    // The auth middleware should populate req.user if authenticated
    if (!req.user) {
         // This case should ideally be handled by the auth middleware sending a 401
         // but adding a log and return here for clarity if auth middleware is skipped or fails silently
        logger.warn('GET /me: User not authenticated after middleware');
        return res.status(401).json({ message: 'User not authenticated' });
    }
    logger.info(`Fetching profile for user ID: ${req.user.userId}`);

    try {
        const user = await User.findById(req.user.userId).select('-password'); // Exclude password
        if (!user) {
             logger.warn(`GET /me: User not found in DB for ID: ${req.user.userId}`);
            return res.status(404).json({ message: 'User not found' });
        }
        logger.info(`Successfully fetched profile for user: ${user.username}`);
        res.json(user);
    } catch (err) {
        logger.error(`Error fetching user profile for ID ${req.user.userId}: ${err.message}`);
        next(err);
    }
});

router.post('/login', [
    body('usernameOrEmail').custom(value => {
        if (!value) {
          throw new Error('Username or email is required');
        }
        return true;
      }),

    body('password')
        .isLength({ min: 5 })
        .withMessage('Password must be at least 5 characters long')
], async (req, res, next) => { // Added next here
    logger.info(`Executing route: POST /api/login`); // Corrected log path
    logger.info(`Received login request body: ${JSON.stringify(req.body)}`); // Log the full body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Validation errors in login: ${JSON.stringify(errors.array())}`);
        return res.status(400).json({ errors: errors.array() });
    }
    logger.info('Login validation successful');

    const { usernameOrEmail, password } = req.body;

    logger.info(`Attempting to find user by username or email: ${usernameOrEmail}`);
    try {
        // Check if the user exists and explicitly select the password field
        const user = await User.findOne({ 
          $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] 
        }).select('+password');
        if (!user) {
            logger.warn(`Login attempt with invalid username or email: ${usernameOrEmail}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        logger.info(`User found: ${user.username}`);

        // Validate password
        if (!user.password) {
            logger.warn(`User ${user.username} has no password set`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        logger.info(`Comparing password for user: ${user.username}`);
        
        // Log detailed password comparison info
        const comparisonDetails = {
          providedPassword: password,
          providedPasswordLength: password.length,
          storedHash: user.password,
          hashStartsWith: user.password ? user.password.substring(0, 10) : 'null',
          hashLength: user.password ? user.password.length : 0,
          isBcryptHash: user.password && user.password.startsWith('$2a$'),
          passwordChars: Array.from(password).map(c => c.charCodeAt(0)),
          passwordRaw: password.split('').map(c => `${c} (${c.charCodeAt(0)})`).join(' ')
        };
        
        logger.debug('Password comparison details:', comparisonDetails);
        
        // Try direct comparison first for debugging
        if (user.password === password) {
          logger.debug('Direct password match!');
        } else {
          logger.debug('No direct password match');
        }
        
        // Try bcrypt comparison
        const isMatch = await bcrypt.compare(password, user.password);
        logger.debug('Bcrypt comparison result:', { isMatch });
        
        // If bcrypt fails, try with trimmed password
        if (!isMatch) {
            logger.warn(`Login attempt with invalid password for user: ${user.username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        logger.info('Password comparison successful');

        // Create JWT token
        logger.info(`Generating JWT token for user: ${user.username}`);
        const expiresIn = process.env.JWT_EXPIRES_IN || '10h';
        const token = jwt.sign(
          { userId: user._id, roles: user.roles },
          process.env.JWT_SECRET,
          { expiresIn }
        );
        logger.info(`JWT token generated with expiration: ${expiresIn}`);

        // Log the user object sent in the response (excluding password)
        const userResponse = user.toObject();
        delete userResponse.password;
        logger.info(`Sending success response for login: ${JSON.stringify({ user: userResponse, token: '[REDACTED]' })}`);
        return res.status(200).json({ 
          user: userResponse, 
          token, 
          expiresIn: expiresIn 
        });
    } catch (err) {
        logger.error(`Error during login process for username or email ${usernameOrEmail}: ${err.message}`);
        next(err);
    }
});

module.exports = router;