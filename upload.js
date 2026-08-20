const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // PDF check
        const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
        
        // Sirf file ka naam, extension nahi
        const cleanName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");
        const finalName = `${cleanName}_${Date.now()}`;

        return {
            folder: 'student_marksheets',
            // Sirf 'auto' use karo PDF aur image dono ke liye, aur format force karo
            resource_type: 'auto',
            public_id: finalName,
            // Agar PDF hai toh format 'pdf' set karo, warna upload default rehne do
            format: isPdf ? 'pdf' : undefined 
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
