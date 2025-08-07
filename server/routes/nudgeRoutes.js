// server/routes/nudgeRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getLatestNudge, getQuantifiableInsights } = require('../controllers/nudgeController');

router.get('/', protect, getLatestNudge);
router.get('/metrics', protect, getQuantifiableInsights);

module.exports = router;