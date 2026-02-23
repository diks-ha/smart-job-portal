const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');
const aiService = require('../services/aiService');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    res.json({
        success: true,
        data: user
    });
}));

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
    // Users can only update their own profile (except admins)
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this profile'
        });
    }

    const { profile, skills } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Update fields
    if (profile) {
        user.profile = { ...user.profile.toObject(), ...profile };
    }
    if (skills) {
        user.profile.skills = skills;
    }

    await user.save();

    res.json({
        success: true,
        data: user
    });
}));

// @route   POST /api/users/:id/resume
// @desc    Upload and parse resume
// @access  Private
router.post('/:id/resume', protect, upload.single('resume'), asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this profile'
        });
    }

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload a PDF file'
        });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Parse resume using AI
    const resumeText = await aiService.parseResume(req.file.path);
    const extractedSkills = await aiService.extractSkills(resumeText);

    // Update user resume
    user.resume = {
        url: `/uploads/${req.file.filename}`,
        text: resumeText,
        skills: extractedSkills,
        uploadedAt: new Date()
    };

    // Also add extracted skills to profile if not already there
    const existingSkills = user.profile.skills || [];
    const newSkills = [...new Set([...existingSkills, ...extractedSkills])];
    user.profile.skills = newSkills;

    await user.save();

    res.json({
        success: true,
        data: {
            resume: user.resume,
            skills: user.profile.skills
        }
    });
}));

// @route   GET /api/users/:id/applications
// @desc    Get user's job applications
// @access  Private
router.get('/:id/applications', protect, asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view these applications'
        });
    }

    const applications = await Application.find({ candidateId: req.params.id })
        .populate('jobId')
        .sort('-createdAt');

    res.json({
        success: true,
        data: applications
    });
}));

// @route   GET /api/users/:id/recommendations
// @desc    Get AI job recommendations
// @access  Private
router.get('/:id/recommendations', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Get active jobs
    const jobs = await Job.find({ status: 'active' }).limit(50);

    if (jobs.length === 0) {
        return res.json({
            success: true,
            data: []
        });
    }

    // Get recommendations using AI
    const recommendations = await aiService.getJobRecommendations(user, jobs);

    res.json({
        success: true,
        data: recommendations
    });
}));

// Error handling for multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
});

module.exports = router;
