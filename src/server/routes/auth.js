// routes/auth.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');



const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');
const devLogin = require('../devLogin');
require('dotenv').config();

const router = express.Router();

router.post('/upload', upload.single('file'), (req, res) => {
    logger.info(`Executing route: POST /upload`);
    if (req.file === undefined) return res.status(400).json({ msg: 'No file uploaded' });
    res.status(200).json({ file: req.file });
});

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
], async (req, res) => {
    logger.info(`Executing route: POST /signup`);
    const errors = validationResult(req);// Add validation to the signup route to make sure that the username, email and password fields are present and have the correct format. The username should have between 3 and 20 characters, email should have an valid format and the password should have at least 8 characters, one capital letter and one number. If the data is not valid send a 400 response with an array of error messages.
    if (!errors.isEmpty()) {
        logger.warn(`Validation errors in registration: ${errors.array()}`);
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, isCreator } = req.body; 

    logger.info(`Received registration request for email: ${email}`);

    try {
        // Check if the user already exists by email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          logger.warn(`Attempt to register with existing email: ${email}`);
          return res.status(409).json({ message: 'Email already exists' });
        }
        //check if the username already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            logger.warn(`Attempt to register with existing username: ${username}`);
            return res.status(409).json({ message: 'Username already exists' });
        }
    
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
          username,
          email,
          password: hashedPassword,
          isCreator: isCreator ?? false,

        });

        await newUser.save();
        logger.info(`User registered successfully: ${email}`);
        res.status(201).json({ newUser });
    } catch (err) {        
        if(err.code !== 11000) next(err)
        else res.status(500).json({ message: 'Error while creating user' });
        logger.error(`Error in registration for email: ${email} - ${err.message}`); 
        
    }
});

// Route to create a test user (only in development)
if (process.env.NODE_ENV === 'development') {
    router.post('/createTestUser', async (req, res) => {
        logger.info(`Executing route: POST /createTestUser`);
        try {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('test', salt);

            // Create a new test user
            const newTestUser = new User({
                username: 'test',
                email: 'test@test.com',
                password: hashedPassword,
                isCreator: false,
            });

            await newTestUser.save();
            logger.info(`Test user created successfully: test@test.com`);
            res.status(201).json({ message: 'Test user created successfully' });
        } catch (err) {
            logger.error(`Error creating test user: ${err.message}`);
            res.status(500).json({ message: 'Error creating test user' });
        }
    });
}



router.get('/me', async (req, res, next) => {
    logger.info(`Executing route: GET /me`);    
    if(req.header('Authorization')){
        auth()(req, res, next);
    }else{        devLogin(req,res,next);    }    try {
        // Check if user is logged
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const user = await User.findById(req.user.userId);
        res.json(user);
    } catch (err) {
        next(err);
        logger.error(`Error fetching user profile: ${err.message}`);
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
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
], async (req, res) => {
    logger.info(`Executing route: POST /login`);
    const errors = validationResult(req);// Add validation to the login route to make sure that the username and password fields are present and have the correct format. The username should have between 3 and 20 characters, and the password should have at least 8 characters. If the data is not valid send a 400 response with an array of error messages.    
    
    if (!errors.isEmpty()) {
        logger.warn(`Validation errors in login: ${errors.array()}`);
        return res.status(400).json({ errors: errors.array() });
    }    const { username, password } = req.body;
    const { usernameOrEmail } = req.body;
    logger.info(`Received login request for username or email: ${usernameOrEmail}`);

    try {
        // Check if the user exists
        const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
        if (!user) {
            logger.warn(`Login attempt with invalid username or email: ${usernameOrEmail}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn(`Login attempt with invalid password for username: ${username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id, roles: user.roles }, process.env.JWT_SECRET, {
            expiresIn: '10h',
        });        

        logger.info(`User logged in successfully: ${user}`);
        return res.status(200).json({ user, token, expiresIn: '10h' });
    } catch (err) {        
        logger.error(`Error in login for username or email: ${usernameOrEmail} - ${err.message}`);
        next(err);        
    }
});

module.exports = router;