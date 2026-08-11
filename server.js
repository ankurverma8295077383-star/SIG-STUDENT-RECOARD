const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models Import
const Batch = require('./models/Batch');
const Student = require('./models/Student');
const Admin = require('./models/Admin');
const upload = require('./upload'); // Cloudinary upload setup

const app = express();
app.use(express.json()); // JSON data accept karne ke liye
app.use(express.static('public')); // Frontend folder ko host karne ke liye 

const PORT = process.env.PORT || 5000;

// Basic test route
app.get('/', (req, res) => {
    res.send("Student Record Portal Backend is Running!");
});

// ==========================================
// SECURITY MIDDLEWARE (Taala)
// ==========================================
const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: "Access Denied. Pehle login karein." });

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.admin = verified;
        next(); 
    } catch (error) {
        res.status(400).json({ error: "Invalid Token." });
    }
};

// ==========================================
// API ROUTES
// ==========================================

// 0. Admin Login API
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(400).json({ error: "Username galat hai" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ error: "Password galat hai" });

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.status(200).json({ message: "Login Successful", token });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// 1. Naya Batch Add karne ka API (Secured)
app.post('/api/add-batch', authenticateAdmin, async (req, res) => {
    try {
        const { batchName } = req.body;
        if (!batchName) return res.status(400).json({ error: "Batch ka naam dena zaroori hai" });

        const newBatch = new Batch({ batchName });
        await newBatch.save();
        res.status(201).json({ message: "Batch successfully added!", batch: newBatch });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ error: "Ye batch pehle se maujood hai" });
        res.status(500).json({ error: "Server error" });
    }
});

// 2. Saare Batches fetch karne ka API
app.get('/api/get-batches', async (req, res) => {
    try {
        const batches = await Batch.find().sort({ createdAt: -1 }); 
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ error: "Batches fetch nahi ho paye" });
    }
});

// 3. Naya Student Add karne ka API (Secured)
app.post('/api/add-student', authenticateAdmin, async (req, res) => {
    try {
        // Naya student banate waqt uska default password (Roll No) encrypt karke save karna
        const hashedPassword = await bcrypt.hash(req.body.rollNo, 10);
        
        const studentData = {
            ...req.body,
            password: hashedPassword
        };

        const newStudent = new Student(studentData);
        await newStudent.save();
        res.status(201).json({ message: "Student successfully added!", student: newStudent });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ error: "Is Roll No. ka student pehle se maujood hai" });
        res.status(500).json({ error: "Student save karne mein error aayi", details: error.message });
    }
});

// 4. Kisi specific batch ke students fetch karne ka API
app.get('/api/students/:batchId', async (req, res) => {
    try {
        const students = await Student.find({ batchId: req.params.batchId }).sort({ createdAt: -1 });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: "Students fetch nahi ho paye" });
    }
});

// 5. Marksheet Upload API (Secured)
app.post('/api/upload-marksheet/:studentId', authenticateAdmin, upload.single('marksheet'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File upload fail ho gayi" });

        const fileUrl = req.file.path; 

        await Student.findByIdAndUpdate(
            req.params.studentId, 
            { marksheetUrl: fileUrl }, 
            { new: true }
        );

        res.status(200).json({ message: "Marksheet uploaded successfully", marksheetUrl: fileUrl });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Server error in file upload" });
    }
});


// ==========================================
// STUDENT SECURITY MIDDLEWARE
// ==========================================
const authenticateStudent = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: "Access Denied. Student login required." });

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.student = verified;
        next(); 
    } catch (error) {
        res.status(400).json({ error: "Invalid Student Token." });
    }
};

// ==========================================
// STUDENT API ROUTES
// ==========================================

// 1. Student Login API
app.post('/api/student/login', async (req, res) => {
    try {
        const { rollNo, password } = req.body;
        
        const student = await Student.findOne({ rollNo });
        if (!student) return res.status(400).json({ error: "Roll No galat hai" });

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(400).json({ error: "Password galat hai" });

        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.status(200).json({ message: "Login Successful", token });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// 2. Student Profile & Result Fetch API (Secured)
app.get('/api/student/profile', authenticateStudent, async (req, res) => {
    try {
        // Password ko chhod kar baaki data bhejenge
        const student = await Student.findById(req.student.id).select('-password');
        if (!student) return res.status(404).json({ error: "Student record nahi mila" });
        
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


// 6. Update Student Marks API (Secured for 54 Data Points)
app.post('/api/update-marks/:studentId', authenticateAdmin, async (req, res) => {
    try {
        await Student.findByIdAndUpdate(
            req.params.studentId,
            { marks: req.body.marks },
            { new: true }
        );
        res.status(200).json({ message: "Marks successfully updated" });
    } catch (error) {
        res.status(500).json({ error: "Marks update fail ho gaye" });
    }
});

// ==========================================
// PASSWORD MANAGEMENT APIs
// ==========================================

// 1. Admin API: Reset Student Password to Default (Roll No)
app.post('/api/admin/reset-password/:studentId', authenticateAdmin, async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).json({ error: "Student nahi mila" });

        // Default password wapas Roll No ko bana do
        const hashedPassword = await bcrypt.hash(student.rollNo, 10);
        student.password = hashedPassword;
        await student.save();

        res.status(200).json({ message: `Password successfully reset to default (${student.rollNo})` });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// 2. Student API: Change Password (Old Password to New Password)
app.post('/api/student/change-password', async (req, res) => {
    try {
        const { rollNo, oldPassword, newPassword } = req.body;
        
        const student = await Student.findOne({ rollNo });
        if (!student) {
            return res.status(400).json({ error: "Roll No nahi mila." });
        }

        const isMatch = await bcrypt.compare(oldPassword, student.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Purana password galat hai." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        student.password = hashedPassword;
        await student.save();

        res.status(200).json({ message: "Password successfully change ho gaya. Ab login karein." });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ==========================================
// DELETE APIs (Admin Only)
// ==========================================

// 1. Delete Individual Student
app.delete('/api/delete-student/:studentId', authenticateAdmin, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.studentId);
        res.status(200).json({ message: "Student record successfully deleted." });
    } catch (error) {
        res.status(500).json({ error: "Student delete karne mein error aayi." });
    }
});

// 2. Delete Entire Batch (Aur uske andar ke saare students)
app.delete('/api/delete-batch/:batchId', authenticateAdmin, async (req, res) => {
    try {
        const batchId = req.params.batchId;
        
        // Pehle is batch ke saare students delete karo taaki database clean rahe
        await Student.deleteMany({ batchId: batchId });
        
        // Fir finally batch ko delete kar do
        await Batch.findByIdAndDelete(batchId);
        
        res.status(200).json({ message: "Batch aur uske saare students delete ho gaye." });
    } catch (error) {
        res.status(500).json({ error: "Batch delete karne mein error aayi." });
    }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});