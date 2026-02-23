const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, isRecruiter } = require('../middleware/auth');
const aiService = require('../services/aiService');

// @route   POST /api/applications
// @desc    Apply to a job
// @access  Private (Job seekers only)
router.post('/', protect, asyncHandler(async (req, res) => {
    const { jobId, coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
        jobId,
        candidateId: req.user.id
    });

    if (existingApplication) {
        return res.status(400).json({
            success: false,
            message: 'You have already applied to this job'
        });
    }

    // Get candidate's resume
    const candidate = await User.findById(req.user.id);

    // Calculate match score using AI
    let matchScore = 0;
    if (candidate.resume && candidate.resume.text) {
        matchScore = await aiService.calculateMatchScore(
            candidate.resume.text,
            job.description,
            candidate.resume.skills || [],
            job.skills || []
        );
    }

    // Create application
    const application = await Application.create({
        jobId,
        candidateId: req.user.id,
        recruiterId: job.recruiterId,
        coverLetter,
        matchScore,
        resumeUrl: candidate.resume?.url || '',
        status: 'pending'
    });

    // Update job applicants count
    job.applicantCount += 1;
    job.applicants.push(req.user.id);
    await job.save();

    // Populate the application
    await application.populate([
        { path: 'jobId', select: 'title company location type' },
        { path: 'candidateId', select: 'profile email resume' }
    ]);

    res.status(201).json({
        success: true,
        data: application
    });
}));

// @route   GET /api/applications/candidate/:id
// @desc    Get candidate's applications
// @access  Private
router.get('/candidate/:id', protect, asyncHandler(async (req, res) => {
    // Only the candidate or admin can view their applications
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view these applications'
        });
    }

    const applications = await Application.find({ candidateId: req.params.id })
        .populate('jobId', 'title company location type salary status')
        .populate('recruiterId', 'profile.company profile.avatar')
        .sort('-createdAt');

    res.json({
        success: true,
        data: applications
    });
}));

// @route   GET /api/applications/job/:id
// @desc    Get job applicants (for recruiter)
// @access  Private (Recruiter only)
router.get('/job/:id', protect, isRecruiter, asyncHandler(async (req, res) => {
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
            message: 'Not authorized to view applicants for this job'
        });
    }

    const applications = await Application.find({ jobId: req.params.id })
        .populate('candidateId', 'profile email resume createdAt')
        .sort('-matchScore -createdAt');

    res.json({
        success: true,
        data: applications
    });
}));

// @route   GET /api/applications/job/:id/ranked
// @desc    Get ranked candidates for a job (AI-sorted)
// @access  Private (Recruiter only)
router.get('/job/:id/ranked', protect, isRecruiter, asyncHandler(async (req, res) => {
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
            message: 'Not authorized to view applicants for this job'
        });
    }

    const { minScore, status, search } = req.query;

    let query = { jobId: req.params.id };

    if (minScore) {
        query.matchScore = { $gte: parseInt(minScore) };
    }

    if (status) {
        query.status = status;
    }

    const applications = await Application.find(query)
        .populate('candidateId', 'profile email resume skills')
        .sort('-matchScore -createdAt');

    // If search is provided, filter candidates
    let filteredApplications = applications;
    if (search) {
        const searchLower = search.toLowerCase();
        filteredApplications = applications.filter(app => {
            const candidate = app.candidateId;
            const fullName = `${candidate.profile?.firstName || ''} ${candidate.profile?.lastName || ''}`.toLowerCase();
            const skills = candidate.profile?.skills?.join(' ').toLowerCase() || '';
            return fullName.includes(searchLower) || skills.includes(searchLower);
        });
    }

    // Add match details
    const rankedCandidates = filteredApplications.map(app => ({
        ...app.toObject(),
        matchDetails: {
            score: app.matchScore,
            skillsMatch: calculateSkillsMatch(
                app.candidateId.profile?.skills || [],
                job.skills || []
            ),
            experience: 'Match based on experience'
        }
    }));

    res.json({
        success: true,
        data: rankedCandidates,
        summary: {
            total: applications.length,
            byStatus: {
                pending: applications.filter(a => a.status === 'pending').length,
                reviewing: applications.filter(a => a.status === 'reviewing').length,
                shortlisted: applications.filter(a => a.status === 'shortlisted').length,
                rejected: applications.filter(a => a.status === 'rejected').length,
                accepted: applications.filter(a => a.status === 'accepted').length
            },
            averageScore: applications.length > 0
                ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
                : 0
        }
    });
}));

// @route   PUT /api/applications/:id
// @desc    Update application status
// @access  Private (Recruiter only)
router.put('/:id', protect, isRecruiter, asyncHandler(async (req, res) => {
    const { status, notes } = req.body;

    const application = await Application.findById(req.params.id)
        .populate('jobId');

    if (!application) {
        return res.status(404).json({
            success: false,
            message: 'Application not found'
        });
    }

    // Check ownership
    if (application.recruiterId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this application'
        });
    }

    // Update status
    application.status = status;
    if (notes) {
        application.notes = notes;
    }

    // Add to timeline
    application.timeline.push({
        status,
        date: new Date(),
        note: notes || ''
    });

    await application.save();

    await application.populate([
        { path: 'jobId', select: 'title company' },
        { path: 'candidateId', select: 'profile email' }
    ]);

    res.json({
        success: true,
        data: application
    });
}));

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id)
        .populate('jobId')
        .populate('candidateId', 'profile email resume')
        .populate('recruiterId', 'profile.company');

    if (!application) {
        return res.status(404).json({
            success: false,
            message: 'Application not found'
        });
    }

    // Check authorization
    const isOwner = application.candidateId._id.toString() === req.user.id;
    const isRecruiter = application.recruiterId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isRecruiter && !isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view this application'
        });
    }

    res.json({
        success: true,
        data: application
    });
}));

// Helper function to calculate skills match
function calculateSkillsMatch(candidateSkills, jobSkills) {
    if (!candidateSkills || !jobSkills || candidateSkills.length === 0 || jobSkills.length === 0) {
        return 0;
    }

    const candidateLower = candidateSkills.map(s => s.toLowerCase());
    const jobLower = jobSkills.map(s => s.toLowerCase());

    const matches = jobLower.filter(skill =>
        candidateLower.some(c => c.includes(skill) || skill.includes(c))
    );

    return Math.round((matches.length / jobLower.length) * 100);
}

module.exports = router;
