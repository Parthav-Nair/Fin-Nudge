
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    // Array to store personalized budget settings for the user
    budgets: [{
        category: {
            type: String,
            required: true,
            trim: true
        },
        amount: { 
            type: Number,
            required: true,
            min: [0, 'Budget amount cannot be negative']
        },
        startDate: { 
            type: Date,
            required: [true, 'Budget start date is required']
        },
        endDate: { 
            type: Date,
            required: [true, 'Budget end date is required']
        }
    }],
    // Stores baseline spending data for quantification 
    
    baselineSpending: {
        impulseAverageWeekly: {
            type: Number,
            default: 0,
            min: 0
        },
        diningAverageWeekly: {
            type: Number,
            default: 0,
            min: 0
        },
        entertainmentAverageWeekly: {
            type: Number,
            default: 0,
            min: 0
        },
        groceriesAverageWeekly: { 
            type: Number,
            default: 0,
            min: 0
        },
        transportAverageWeekly: { 
            type: Number,
            default: 0,
            min: 0
        },
        utilitiesAverageWeekly: { 
            type: Number,
            default: 0,
            min: 0
        },
        shoppingAverageWeekly: { 
            type: Number,
            default: 0,
            min: 0
        },
        otherAverageWeekly: { 
            type: Number,
            default: 0,
            min: 0
        },
        lastCalculated: { 
            type: Date,
            default: Date.now
        }
    },
}, {
    timestamps: true 
});

// Mongoose Pre-save Hook: Hash password before saving a new user or updating password
userSchema.pre('save', async function(next) {
    
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10); 
        this.password = await bcrypt.hash(this.password, salt); 
        next(); 
    } catch (error) {
        next(error); 
    }
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);