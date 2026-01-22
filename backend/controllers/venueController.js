const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Get all venues
// @route   GET /api/venues
// @access  Public
exports.getVenues = async (req, res, next) => {
  try {
    const {
      sportType,
      city,
      minPrice,
      maxPrice,
      minRating,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query = { isActive: true, isApproved: true };

    if (sportType) {
      query.sportTypes = sportType;
    }

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    if (minRating) {
      query['rating.average'] = { $gte: Number(minRating) };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const venues = await Venue.find(query)
      .populate('owner', 'name email')
      .sort({ 'rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Venue.countDocuments(query);

    res.status(200).json({
      success: true,
      count: venues.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: venues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single venue
// @route   GET /api/venues/:id
// @access  Public
exports.getVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name avatar',
        },
        options: { sort: { createdAt: -1 }, limit: 10 },
      });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    res.status(200).json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create venue
// @route   POST /api/venues
// @access  Private (Venue Owner)
exports.createVenue = async (req, res, next) => {
  try {
    // Construct location object from flat fields if location is not provided
    if (!req.body.location) {
      req.body.location = {
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country || 'Nepal', // Default country
        coordinates: {
          latitude: req.body.latitude,
          longitude: req.body.longitude
        }
      };
    }

    // Default capacity if not provided
    if (!req.body.capacity) {
      req.body.capacity = 20; // Default capacity
    }

    req.body.owner = req.user.id;

    // Handle image uploads
    if (req.files && req.files.venueImages) {
      req.body.images = req.files.venueImages.map(
        (file) => `/uploads/venues/${file.filename}`
      );
    }

    // Auto-approve if created by super_admin (Admin cannot create anymore per new rule)
    if (req.user.role === 'super_admin') {
      req.body.isApproved = true;
    }

    // Default time slots if not provided (06:00 to 22:00)
    if (!req.body.timeSlots || req.body.timeSlots.length === 0) {
      const defaultSlots = [];
      for (let i = 6; i < 22; i++) {
        const start = i < 10 ? `0${i}:00` : `${i}:00`;
        const end = i + 1 < 10 ? `0${i + 1}:00` : `${i + 1}:00`;
        defaultSlots.push({
          startTime: start,
          endTime: end,
          isAvailable: true,
        });
      }
      req.body.timeSlots = defaultSlots;
    }

    const venue = await Venue.create(req.body);

    res.status(201).json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update venue
// @route   PUT /api/venues/:id
// @access  Private (Venue Owner)
exports.updateVenue = async (req, res, next) => {
  try {
    let venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Make sure user is venue owner
    if (venue.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this venue',
      });
    }

    // Construct location object from flat fields if present
    if (req.body.address || req.body.city || req.body.state) {
      req.body.location = {
        address: req.body.address || venue.location.address,
        city: req.body.city || venue.location.city,
        state: req.body.state || venue.location.state,
        zipCode: req.body.zipCode || venue.location.zipCode,
        country: req.body.country || venue.location.country || 'Nepal',
        coordinates: {
          latitude: req.body.latitude || venue.location.coordinates?.latitude,
          longitude: req.body.longitude || venue.location.coordinates?.longitude
        }
      };
    }

    // Handle image uploads
    if (req.files && req.files.venueImages) {
      const newImages = req.files.venueImages.map(
        (file) => `/uploads/venues/${file.filename}`
      );
      req.body.images = [...(venue.images || []), ...newImages];
    }

    venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete venue
// @route   DELETE /api/venues/:id
// @access  Private (Venue Owner/Admin)
exports.deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Make sure user is venue owner or admin
    if (venue.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this venue',
      });
    }

    await venue.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available time slots
// @route   GET /api/venues/:id/availability
// @access  Public
exports.getAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date',
      });
    }

    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Check if date is blocked
    const bookingDate = new Date(date);
    const isBlocked = venue.blockedDates.some(
      (bd) => new Date(bd.date).toDateString() === bookingDate.toDateString()
    );

    if (isBlocked) {
      return res.status(200).json({
        success: true,
        data: {
          available: false,
          slots: [],
          message: 'This date is blocked',
        },
      });
    }

    // Get existing bookings for this date
    const existingBookings = await Booking.find({
      venue: req.params.id,
      bookingDate: bookingDate,
      status: { $in: ['pending', 'confirmed'] },
    });

    // Filter available slots
    const availableSlots = venue.timeSlots.filter((slot) => {
      const isBooked = existingBookings.some(
        (booking) =>
          booking.startTime === slot.startTime && booking.endTime === slot.endTime
      );
      return slot.isAvailable && !isBooked;
    });

    res.status(200).json({
      success: true,
      data: {
        available: availableSlots.length > 0,
        slots: availableSlots,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block dates for venue
// @route   POST /api/venues/:id/block-dates
// @access  Private (Venue Owner)
exports.blockDates = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    if (venue.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const { dates, reason } = req.body;

    dates.forEach((date) => {
      venue.blockedDates.push({ date: new Date(date), reason: reason || 'Blocked by owner' });
    });

    await venue.save();

    res.status(200).json({
      success: true,
      data: venue.blockedDates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's venues
// @route   GET /api/venues/owner/my-venues
// @access  Private (Venue Owner)
exports.getMyVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: venues.length,
      data: venues,
    });
  } catch (error) {
    next(error);
  }
};

