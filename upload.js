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
        const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
        
        // File ke naam se space aur special characters hatana
        const cleanName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");

        if (isPdf) {
            // PDF Logic: Strictly RAW + Force .pdf Extension
            return {
                folder: 'student_marksheets',
                resource_type: 'raw', 
                public_id: `${cleanName}_${Date.now()}.pdf` 
            };
        } else {
            // Image Logic: Auto detect + No extension required in public_id
            return {
                folder: 'student_marksheets',
                resource_type: 'auto',
                public_id: `${cleanName}_${Date.now()}`
            };
        }
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
