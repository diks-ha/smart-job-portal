const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, isRecruiter } = require('../middleware/auth');
const aiService = require('../services/aiService');
const User = require('../models/User');
const Job = require('../models/Job');

// @route   POST /api/ai/match
// @desc    Match resume to job
// @access  Private
router.post('/match', protect, asyncHandler(async (req, res) => {
    const { resumeText, jobDescription, resumeSkills, jobSkills } = req.body;

    if (!resumeText || !jobDescription) {
        return res.status(400).json({
            success: false,
            message: 'Resume text and job description are required'
        });
    }

    const score = await aiService.calculateMatchScore(
        resumeText,
        jobDescription,
        resumeSkills || [],
        jobSkills || []
    );

    // Get matched and missing skills
    const matchedSkills = aiService.getMatchedSkills(
        resumeSkills || [],
        jobSkills || []
    );

    const missingSkills = (jobSkills || []).filter(
        skill => !matchedSkills.includes(skill.toLowerCase())
    );

    res.json({
        success: true,
        data: {
            score,
            matchedSkills,
            missingSkills,
            analysis: getAnalysis(score)
        }
    });
}));

// @route   POST /api/ai/extract-skills
// @desc    Extract skills from text
// @access  Private
router.post('/extract-skills', protect, asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({
            success: false,
            message: 'Text is required'
        });
    }

    const skills = await aiService.extractSkills(text);

    res.json({
        success: true,
        data: {
            skills
        }
    });
}));

// @route   GET /api/ai/recommendations/:userId
// @desc    Get personalized job recommendations
// @access  Private
router.get('/recommendations/:userId', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

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

    const recommendations = await aiService.getJobRecommendations(user, jobs);

    res.json({
        success: true,
        data: recommendations
    });
}));

// @route   GET /api/ai/analyze-job/:jobId
// @desc    Analyze job requirements
// @access  Private
router.get('/analyze-job/:jobId', protect, asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }

    // Extract skills from job description
    const extractedSkills = await aiService.extractJobSkills(job.description);

    res.json({
        success: true,
        data: {
            originalSkills: job.skills,
            extractedSkills,
            skillsSummary: {
                total: extractedSkills.length,
                categories: categorizeSkills(extractedSkills)
            }
        }
    });
}));

// Helper function to get analysis text
function getAnalysis(score) {
    if (score >= 90) {
        return 'Excellent match! Your profile closely aligns with this job.';
    } else if (score >= 75) {
        return 'Great match! You meet most of the key requirements.';
    } else if (score >= 60) {
        return 'Good match. Consider highlighting relevant skills.';
    } else if (score >= 40) {
        return 'Partial match. Some requirements may need development.';
    } else {
        return 'Low match. This role may require different skills.';
    }
}

// Helper function to categorize skills
function categorizeSkills(skills) {
    const categories = {
        languages: [],
        frameworks: [],
        databases: [],
        tools: [],
        platforms: [],
        other: []
    };

    const skillCategories = {
        languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'scala'],
        frameworks: ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'rails', '.net', 'next.js', 'nuxt'],
        databases: ['mongodb', 'mysql', 'postgresql', 'sql', 'redis', 'elasticsearch', 'oracle', 'firebase'],
        tools: ['git', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'jenkins', 'jira', 'figma', 'photoshop'],
        platforms: ['linux', 'windows', 'macos', 'ios', 'android', 'web']
    };

    skills.forEach(skill => {
        const lower = skill.toLowerCase();
        let placed = false;

        for (const [category, keywords] of Object.entries(skillCategories)) {
            if (keywords.some(k => lower.includes(k))) {
                categories[category].push(skill);
                placed = true;
                break;
            }
        }

        if (!placed) {
            categories.other.push(skill);
        }
    });

    return categories;
}

module.exports = router;
