// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');
const upload = require('../middlewares/upload');
require('dotenv').config();

const router = express.Router();

router.post('/upload', upload.single('file'), (req, res) => {
    if (req.file === undefined) return res.status(400).json({ msg: 'No file uploaded' });
    res.status(200).json({ file: req.file });
});

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    logger.info(`Received registration request for email: ${email}`);

    try {
        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            logger.warn(`Attempt to register with existing email: ${email}`);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            isCreator: false,
        });

        await newUser.save();
        logger.info(`User registered successfully: ${email}`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        logger.error(`Error in registration for email: ${email} - ${err.message}`);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    logger.info(`Received login request for username: ${username}`);

    try {
        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            logger.warn(`Login attempt with invalid username: ${username}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn(`Login attempt with invalid password for username: ${username}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id, roles: user.roles }, process.env.JWT_SECRET, {
            expiresIn: '10h',
        });

        logger.info(`User logged in successfully: ${username}`);
        res.status(200).json({ token, expiresIn: '1h' });
    } catch (err) {
        logger.error(`Error in login for username: ${username} - ${err.message}`);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;