const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    batchName: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Example: "Batch 1"
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Batch', batchSchema);