const express = require('express');
const router = express.Router();
const {
    getTournaments,
    getTournament,
    createTournament,
    updateTournament,
    deleteTournament,
    registerTeam,
} = require('../controllers/tournamentController');

const { protect, authorize } = require('../middleware/auth');

router.get('/', getTournaments);
router.get('/:id', getTournament);

// Protected routes
router.use(protect);

router.post('/:id/register', authorize('customer'), registerTeam);

// Admin only routes
router.post('/', authorize('admin'), createTournament);
router.put('/:id', authorize('admin'), updateTournament);
router.delete('/:id', authorize('admin'), deleteTournament);

module.exports = router;
