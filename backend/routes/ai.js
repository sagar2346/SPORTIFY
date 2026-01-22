const express = require('express');
const { chat, getRecommendations, getInsights } = require('../controllers/aiController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');

const router = express.Router();

// Public Route (with optional auth for improved context)
router.post('/chat', optionalProtect, chat);

// Protected Routes
router.get('/recommend', protect, getRecommendations);
router.get('/insight', protect, authorize('admin', 'venue_owner'), getInsights);

module.exports = router;
