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
const upload = require('../middleware/upload');

const { protect, authorize } = require('../middleware/auth');

router.get('/', getTournaments);
router.get('/:id', getTournament);

// Protected routes
router.use(protect);

router.post('/:id/register', authorize('customer'), registerTeam);

// Admin only routes
router.post('/', authorize('admin'), upload.single('image'), createTournament);
router.put('/:id', authorize('admin'), upload.single('image'), updateTournament);
router.delete('/:id', authorize('admin'), deleteTournament);

module.exports = router;
