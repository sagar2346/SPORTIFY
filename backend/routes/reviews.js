const express = require('express');
const router = express.Router();
const {
  createReview,
  getVenueReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/venue/:venueId', getVenueReviews);

// Protected routes
router.use(protect);

router.post(
  '/',
  upload.fields([{ name: 'reviewImages', maxCount: 5 }]),
  createReview
);
router.put(
  '/:id',
  upload.fields([{ name: 'reviewImages', maxCount: 5 }]),
  updateReview
);
router.delete('/:id', deleteReview);

module.exports = router;

