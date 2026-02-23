const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const config = require('../config');

// Protect routes - require authentication
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);

        // Get user from token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
});

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Check if user is recruiter
const isRecruiter = (req, res, next) => {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Only recruiters can access this route'
        });
    }
    next();
};

// Check if user is job seeker
const isJobSeeker = (req, res, next) => {
    if (req.user.role !== 'jobseeker' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Only job seekers can access this route'
        });
    }
    next();
};

module.exports = { protect, authorize, isRecruiter, isJobSeeker };
