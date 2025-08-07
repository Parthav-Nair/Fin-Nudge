// server/controllers/budgetController.js
const User = require('../models/User');

// @desc    Set/Update user budgets
// @route   PUT /api/budgets
// @access  Private
const setBudgets = async (req, res) => {
    const userId = req.user.id;
    const { budgets } = req.body;

    if (!Array.isArray(budgets)) {
        return res.status(400).json({ message: 'Budgets must be an array.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.budgets = budgets;
        await user.save();

        res.status(200).json({
            message: 'Budgets updated successfully!',
            budgets: user.budgets
        });
    } catch (error) {
        console.error('Error setting budgets:', error.message);
        res.status(500).json({ message: 'Server error while setting budgets', error: error.message });
    }
};

// @desc    Get user budgets
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).select('budgets');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            message: 'Budgets fetched successfully!',
            budgets: user.budgets
        });
    } catch (error) {
        console.error('Error fetching budgets:', error.message);
        res.status(500).json({ message: 'Server error while fetching budgets', error: error.message });
    }
};

module.exports = {
    setBudgets,
    getBudgets,
};