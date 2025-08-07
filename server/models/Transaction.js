// server/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be positive']
    },
    type: { 
        type: String,
        enum: ['expense', 'income'],
        default: 'expense'
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
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
            'Other' 
        ],
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    // Behavioral Nudging & Quantification Fields 
    moodTag: { // User can tag their mood during the transaction
        type: String,
        enum: ['happy', 'stressed', 'bored', 'anxious', 'excited', 'neutral', 'other', 'no_tag'],
        default: 'no_tag'
    },
    contextTag: { // User can tag the context of the transaction
        type: String,
        enum: ['online_shopping', 'social_outing', 'solo_activity', 'work_related', 'necessity', 'gift', 'travel', 'home_improvement', 'other', 'no_tag'],
        default: 'no_tag'
    },
    isImpulse: { 
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);