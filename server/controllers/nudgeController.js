// server/controllers/nudgeController.js
const NudgeLog = require('../models/NudgeLog');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { getBehavioralNudge } = require('../utils/langchainAgent'); // Our LangChain agent
const { calculateSpendingChange, calculateBudgetAdherence, estimateSavings, calculateBaselineSpending } = require('../utils/metricsCalculator'); // For quantification

// @desc    Get a behavioral nudge for the user
// @route   GET /api/nudges
// @access  Private
const getLatestNudge = async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch necessary user data and recent transactions for the LLM context
        const user = await User.findById(userId).select('-password'); // Exclude password for security
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch recent transactions (e.g., last 30 days) to provide the LLM with context
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentTransactions = await Transaction.find({
            userId,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: -1 });

        // Call the LangChain agent to get a nudge
        const { nudgeMessage, nudgeType, categoryImpacted } = await getBehavioralNudge(user, recentTransactions);

        // Log the generated nudge
        const newNudgeLog = await NudgeLog.create({
            userId,
            nudgeType: nudgeType || 'GeneralInsight', // Default if LLM doesn't provide specific type
            message: nudgeMessage,
            categoryImpacted: categoryImpacted || 'General', // Default if LLM doesn't provide specific category
            triggeredAt: new Date()
        });

        res.status(200).json({
            message: 'Nudge fetched successfully!',
            nudge: {
                message: nudgeMessage,
                type: nudgeType,
                category: categoryImpacted,
                logId: newNudgeLog._id
            }
        });

    } catch (error) {
        console.error('Error fetching latest nudge:', error.message);
        res.status(500).json({ message: 'Server error while fetching nudge', error: error.message });
    }
};

// @desc    Get quantifiable financial insights for the user
// @route   GET /api/metrics
// @access  Private
const getQuantifiableInsights = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const allTransactions = await Transaction.find({ userId }).sort({ date: 1 });
        // --- Add this console.log to check if transactions were fetched ---
        console.log(`Fetched ${allTransactions.length} transactions for user ${userId}`);


        // Calculate Baselines (this would be a scheduled job in a real app)
        await calculateBaselineSpending(userId);
        const updatedUser = await User.findById(userId).select('-password');

        // Calculate Spending Change vs. Baseline
        const spendingChanges = await calculateSpendingChange(userId, updatedUser);

        // Calculate Budget Adherence
        const budgetAdherence = await calculateBudgetAdherence(userId, updatedUser.budgets, allTransactions);

        // Estimate Savings
        const estimatedSavings = await estimateSavings(userId, allTransactions, updatedUser.baselineSpending);

        // --- Add this console.log to check the final insights object ---
        console.log("Calculated Spending Changes:", spendingChanges);
        console.log("Calculated Budget Adherence:", budgetAdherence);
        console.log("Calculated Estimated Savings:", estimatedSavings);

        res.status(200).json({
            message: 'Financial insights fetched successfully!',
            insights: {
                spendingChanges,
                budgetAdherence,
                estimatedSavings,
            }
        });

    } catch (error) {
        console.error('Error fetching quantifiable insights:', error.message);
        res.status(500).json({ message: 'Server error while fetching insights', error: error.message });
    }
};
module.exports = {
    getLatestNudge,
    getQuantifiableInsights,
};