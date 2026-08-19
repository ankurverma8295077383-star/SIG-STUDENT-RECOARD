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
    
    // Overall Placement Status (Matrix se bahar)
    placementStatus: { type: String, default: "Pending" },
    
    // Checkbox selections track karne ke liye required array
    enrolledTechs: { 
        type: [String], 
        default: ['gis', 'rs', 'lidar', 'pht', 'drone', 'gps', 'webgis', 'geoai', 'python'] 
    },

    // Naya Subject-wise Matrix Schema
    marks: { 
        type: Map, 
        of: new mongoose.Schema({
            midTermT: { type: Number, default: 0 },
            midTermP: { type: Number, default: 0 },
            finalT: { type: Number, default: 0 },
            finalP: { type: Number, default: 0 },
            viva: { type: Number, default: 0 },
            attendance: { type: Number, default: 0 },
            reports: { type: Number, default: 0 },
            finalResult: { type: Number, default: 0 },
            grade: { type: String, default: "" }
        }, { _id: false }), 
        default: {} 
    },

    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true }, 
    marksheetUrl: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
