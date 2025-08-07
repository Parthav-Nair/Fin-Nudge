// server/models/NudgeLog.js
const mongoose = require('mongoose');

const nudgeLogSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nudgeType: { // A string identifying the type of nudge 
        type: String,
        required: true,
        trim: true
    },
    message: { // The actual text message of the nudge displayed to the user
        type: String,
        required: true,
        trim: true
    },
    triggeredAt: { // Timestamp when this nudge was generated/identified 
        type: Date,
        default: Date.now
    },
    categoryImpacted: { // The specific spending category this nudge relates to
        type: String,
        trim: true,
        enum: [
            'Dining',
            'Groceries',
            'Transport',
            'Entertainment',
            'Impulse',
            'Utilities',
            'Rent',
            'Shopping',
            'Salary',
            'Investment',
            'Healthcare',
            'Education',
            'Travel',
            'Other',
            'General' 
        ],
        required: false 
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('NudgeLog', nudgeLogSchema);