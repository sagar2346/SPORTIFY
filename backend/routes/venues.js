const express = require('express');
const router = express.Router();
const {
  getVenues,
  getVenue,
  createVenue,
  updateVenue,
  deleteVenue,
  getAvailability,
  blockDates,
  getMyVenues,
} = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getVenues);
router.get('/:id', getVenue);
router.get('/:id/availability', getAvailability);

// Protected routes
router.use(protect);

// Venue owner routes
router.post(
  '/',
  authorize('venue_owner'),
  upload.fields([{ name: 'venueImages', maxCount: 10 }]),
  createVenue
);
router.get('/owner/my-venues', authorize('venue_owner', 'admin'), getMyVenues);
router.put(
  '/:id',
  authorize('venue_owner', 'admin'),
  upload.fields([{ name: 'venueImages', maxCount: 10 }]),
  updateVenue
);
router.delete('/:id', authorize('venue_owner', 'admin'), deleteVenue);
router.post('/:id/block-dates', authorize('venue_owner', 'admin'), blockDates);

module.exports = router;

