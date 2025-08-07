// server/controllers/transactionController.js
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Add a new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
    const { amount, type, category, description, date, moodTag, contextTag, isImpulse } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!amount || !category || !date) {
        return res.status(400).json({ message: 'Please include amount, category, and date for the transaction.' });
    }

    try {
        const newTransaction = await Transaction.create({
            userId,
            amount,
            type,
            category,
            description,
            date,
            moodTag,
            contextTag,
            isImpulse,
        });

        res.status(201).json({
            message: 'Transaction added successfully!',
            transaction: newTransaction
        });
    } catch (error) {
        console.error('Error adding transaction:', error.message);
        res.status(500).json({ message: 'Server error while adding transaction', error: error.message });
    }
};

// @desc    Get all transactions for the authenticated user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    const userId = req.user.id; // From authMiddleware

    try {
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });

        res.status(200).json({
            message: 'Transactions fetched successfully!',
            transactions: transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({ message: 'Server error while fetching transactions', error: error.message });
    }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    const userId = req.user.id;
    const transactionId = req.params.id;

    try {
        const transaction = await Transaction.findOneAndDelete({ _id: transactionId, userId });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found or not authorized' });
        }

        res.status(200).json({ message: 'Transaction deleted successfully!' });
    } catch (error) {
        console.error('Error deleting transaction:', error.message);
        res.status(500).json({ message: 'Server error while deleting transaction', error: error.message });
    }
};

module.exports = {
    addTransaction,
    getTransactions,
    deleteTransaction,
};