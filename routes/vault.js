const express = require('express');
const router = express.Router();
const upload = require('../upload'); 
const Vault = require('../models/Vault');
const cloudinary = require('cloudinary').v2;

// 1. Answer Sheet Upload
router.post('/upload-ans', upload.single('file'), async (req, res) => {
    try {
        const { batchId, subject, unit } = req.body;
        const newFile = new Vault({
            batchId, 
            fileType: 'answersheet', 
            subject, 
            unit,
            fileUrl: req.file.path, 
            publicId: req.file.filename || req.file.public_id 
        });
        await newFile.save();
        res.status(200).json({ message: 'Answer sheet safely uploaded' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

// 2. Manual Marksheet Upload
router.post('/upload-marksheet', upload.single('file'), async (req, res) => {
    try {
        const { batchId } = req.body;
        const newFile = new Vault({
            batchId, 
            fileType: 'marksheet',
            fileUrl: req.file.path, 
            publicId: req.file.filename || req.file.public_id
        });
        await newFile.save();
        res.status(200).json({ message: 'Marksheet securely vaulted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

// 3. Get Files for Vault Manager
router.get('/:batchId', async (req, res) => {
    try {
        const files = await Vault.find({ batchId: req.params.batchId });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vault data' });
    }
});

// 4. Delete File Securely
router.delete('/delete/:id', async (req, res) => {
    try {
        const file = await Vault.findById(req.params.id);
        if (!file) return res.status(404).json({ error: 'File not found' });
        
        // Blind-spot fix: Explicitly define resource_type for Cloudinary destroy
        const isPdf = file.publicId.toLowerCase().endsWith('.pdf');
        await cloudinary.uploader.destroy(file.publicId, { resource_type: isPdf ? 'raw' : 'image' });
        
        // MongoDB se delete karo
        await Vault.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ message: 'File deleted from Vault and Cloudinary' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Deletion failed' });
    }
});

module.exports = router;
