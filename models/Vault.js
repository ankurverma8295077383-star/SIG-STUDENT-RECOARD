const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema({
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    fileType: { type: String, required: true }, // 'answersheet' or 'marksheet'
    subject: { type: String },
    unit: { type: String },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true }, // Delete karne ke liye zaroori hai
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vault', vaultSchema);