// server/routes/budgetRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { setBudgets, getBudgets } = require('../controllers/budgetController');

router.put('/', protect, setBudgets);
router.get('/', protect, getBudgets);

module.exports = router;