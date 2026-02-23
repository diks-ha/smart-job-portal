const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'],
        default: 'pending'
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    coverLetter: {
        type: String,
        maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
    },
    resumeUrl: {
        type: String,
        default: ''
    },
    notes: {
        type: String
    },
    timeline: [{
        status: {
            type: String,
            enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted']
        },
        date: {
            type: Date,
            default: Date.now
        },
        note: {
            type: String
        }
    }]
}, {
    timestamps: true
});

// Index for efficient queries
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ candidateId: 1, createdAt: -1 });
applicationSchema.index({ recruiterId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ matchScore: -1 });

// Add initial timeline entry
applicationSchema.pre('save', function (next) {
    if (this.isNew) {
        this.timeline.push({
            status: this.status,
            date: new Date()
        });
    }
    next();
});

// Static method to check if user already applied
applicationSchema.statics.hasApplied = async function (jobId, candidateId) {
    const application = await this.findOne({ jobId, candidateId });
    return !!application;
};

module.exports = mongoose.model('Application', applicationSchema);
