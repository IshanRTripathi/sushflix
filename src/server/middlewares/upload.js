// middlewares/upload.js
require('dotenv').config({ path: '../../.env' });
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure S3
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Set up multer to use S3 for storage
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET,
        acl: 'public-read',  // or adjust the ACL permissions as needed
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 1024 * 1024 * 5 },  // Optional: Set file size limit to 5 MB
    fileFilter: function (req, file, cb) {
        const allowedMimeTypes = /\/(jpg|jpeg|png|gif)$/;
        if (!allowedMimeTypes.test(file.mimetype)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

module.exports = upload;