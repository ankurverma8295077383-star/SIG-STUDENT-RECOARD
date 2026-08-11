const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    rollNo: { type: String, required: true, unique: true },
    idNo: { type: String },
    name: { type: String, required: true },
    courseName: { type: String },
    mobileNo: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    programOpted: { type: String },
    password: { type: String, required: true },
    
    // 54 marks data points handle karne ke liye Map
    marks: { 
        type: Map, 
        of: Number, 
        default: {} 
    },

    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true }, 
    marksheetUrl: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);