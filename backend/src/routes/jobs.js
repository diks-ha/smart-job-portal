const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, isRecruiter } = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        type,
        location,
        skills,
        search,
        status = 'active',
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status };

    if (type) {
        query.type = type;
    }

    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }

    if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        query.skills = { $in: skillsArray };
    }

    if (search) {
        query.$text = { $search: search };
    }

    // Sort
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
        .populate('recruiterId', 'profile.firstName profile.lastName profile.company profile.avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
        success: true,
        data: jobs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
}));

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id)
        .populate('recruiterId', 'profile.firstName profile.lastName profile.company profile.avatar profile.website');

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.json({
        success: true,
        data: job
    });
}));

// @route   POST /api/jobs
// @desc    Create a job
// @access  Private (Recruiters only)
router.post('/', protect, isRecruiter, asyncHandler(async (req, res) => {
    const jobData = {
        ...req.body,
        recruiterId: req.user.id
    };

    const job = await Job.create(jobData);

    res.status(201).json({
        success: true,
        data: job
    });
}));

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (Job owner only)
router.put('/:id', protect, isRecruiter, asyncHandler(async (req, res) => {
    let job = await Job.findById(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }

    // Check ownership
    if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this job'
        });
    }

    job = await Job.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        data: job
    });
}));

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (Job owner only)
router.delete('/:id', protect, isRecruiter, asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }

    // Check ownership
    if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this job'
        });
    }

    // Delete associated applications
    await Application.deleteMany({ jobId: job._id });

    await job.deleteOne();

    res.json({
        success: true,
        message: 'Job deleted successfully'
    });
}));

// @route   GET /api/jobs/recruiter/:id
// @desc    Get recruiter's jobs
// @access  Private (Recruiter only)
router.get('/recruiter/my-jobs', protect, isRecruiter, asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { recruiterId: req.user.id };
    if (status) {
        query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
        success: true,
        data: jobs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
}));

module.exports = router;
