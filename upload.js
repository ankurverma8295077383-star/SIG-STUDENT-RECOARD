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
        
        // File ka naam clean karna aur extension forcefully lagana
        const cleanName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");
        const finalName = isPdf ? `${cleanName}_${Date.now()}.pdf` : `${cleanName}_${Date.now()}`;

        return {
            folder: 'student_marksheets',
            resource_type: isPdf ? 'raw' : 'auto',
            public_id: finalName // Ye line ensure karegi ki URL aur download dono me .pdf aaye
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
