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
    
    // 54 marks data points handle karne ke liye Map (Ab Theory aur Practical ke sath)
    marks: { 
        type: Map, 
        of: new mongoose.Schema({
            theory: { type: Number, default: 0 },
            practical: { type: Number, default: 0 }
        }, { _id: false }), 
        default: {} 
    },

    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true }, 
    marksheetUrl: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
