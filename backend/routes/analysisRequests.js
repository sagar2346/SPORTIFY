const express = require('express');
const router = express.Router();
const {
    createRequest,
    getTeamRequests,
    updateRequest
} = require('../controllers/analysisRequestController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createRequest);
router.get('/team/:teamId', getTeamRequests);
router.put('/:id', authorize('admin'), updateRequest);

module.exports = router;
