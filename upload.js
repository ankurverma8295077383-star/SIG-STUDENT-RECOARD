const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary connection setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage settings for clean preview and PDF rendering
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'student_marksheets',
        resource_type: 'auto', // 'auto' use karne se Cloudinary PDF aur images ko properly render karta hai
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
    },
});

const upload = multer({ storage: storage });

module.exports = upload;