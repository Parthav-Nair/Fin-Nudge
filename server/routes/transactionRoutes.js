// server/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController');

router.post('/', protect, addTransaction);
router.get('/', protect, getTransactions);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;