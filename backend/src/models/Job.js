const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [200, 'Job title cannot exceed 200 characters']
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    companyLogo: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    requirements: [{
        type: String,
        trim: true
    }],
    responsibilities: [{
        type: String,
        trim: true
    }],
    location: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
        default: 'full-time'
    },
    salary: {
        min: {
            type: Number
        },
        max: {
            type: Number
        },
        currency: {
            type: String,
            default: 'USD'
        },
        period: {
            type: String,
            enum: ['hourly', 'monthly', 'yearly'],
            default: 'yearly'
        }
    },
    skills: [{
        type: String,
        trim: true
    }],
    experienceLevel: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
        default: 'mid'
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'draft'],
        default: 'active'
    },
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    applicantCount: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for search
jobSchema.index({
    title: 'text',
    description: 'text',
    company: 'text',
    skills: 'text'
});

// Index for filtering
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ recruiterId: 1 });
jobSchema.index({ type: 1, location: 1 });

// Virtual for salary range display
jobSchema.virtual('salaryRange').get(function () {
    if (this.salary && this.salary.min && this.salary.max) {
        return `${this.salary.currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()}`;
    }
    return 'Salary not specified';
});

// Ensure virtuals are included in JSON
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
