const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Check if booking is completed or confirmed
    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review confirmed or completed bookings',
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking',
      });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.reviewImages) {
      images = req.files.reviewImages.map(
        (file) => `/uploads/reviews/${file.filename}`
      );
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      venue: booking.venue,
      booking: bookingId,
      rating,
      comment,
      images,
    });

    // Update venue rating
    await updateVenueRating(booking.venue);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for venue
// @route   GET /api/reviews/venue/:venueId
// @access  Public
exports.getVenueReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ venue: req.params.venueId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Handle image uploads
    if (req.files && req.files.reviewImages) {
      const newImages = req.files.reviewImages.map(
        (file) => `/uploads/reviews/${file.filename}`
      );
      req.body.images = [...(review.images || []), ...newImages];
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Update venue rating
    await updateVenueRating(review.venue);

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const venueId = review.venue;
    await review.deleteOne();

    // Update venue rating
    await updateVenueRating(venueId);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update venue rating
const updateVenueRating = async (venueId) => {
  const reviews = await Review.find({ venue: venueId });
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await Venue.findByIdAndUpdate(venueId, {
    'rating.average': Math.round(average * 10) / 10,
    'rating.count': reviews.length,
  });
};

