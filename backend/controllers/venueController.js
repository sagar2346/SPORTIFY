// Venue Controller for SPORTIFY
const mongoose = require('mongoose');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/User');

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

    // Date & Time Slot Filtering
    if (req.query.date) {
      const searchDate = new Date(req.query.date);
      const searchDay = searchDate.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();

      // 1. Check if dates are blocked
      const blockedVenues = await Venue.find({
        blockedDates: {
          $elemMatch: {
            date: {
              $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
              $lt: new Date(searchDate.setHours(23, 59, 59, 999))
            }
          }
        }
      }).select('_id');

      const blockedVenueIds = blockedVenues.map(v => v._id);

      // 2. Check existing bookings (Overlap check)
      let bookedVenueIds = [];
      if (req.query.startTime) {
        const queryEndTime = req.query.endTime || (parseInt(req.query.startTime.split(':')[0]) + 1).toString().padStart(2, '0') + ':00';
        const bookings = await Booking.find({
          bookingDate: {
            $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
            $lt: new Date(searchDate.setHours(23, 59, 59, 999))
          },
          status: { $in: ['pending', 'confirmed', 'completed'] },
          $or: [
            {
              $and: [
                { startTime: { $lt: queryEndTime } },
                { endTime: { $gt: req.query.startTime } }
              ]
            }
          ]
        }).select('venue');

        bookedVenueIds = bookings.map(b => b.venue);
      }

      // 3. Combine exclusions
      const excludeIds = [...new Set([...blockedVenueIds, ...bookedVenueIds])];
      if (excludeIds.length > 0) {
        query._id = { $nin: excludeIds };
      }

      // 4. Time specific availability (if startTime provided)
      if (req.query.startTime) {
        query.timeSlots = {
          $elemMatch: {
            startTime: req.query.startTime,
            isAvailable: true
          }
        };
      }

      // 5. Ensure venue is open on that day
      query[`operatingHours.${searchDay}.isOpen`] = true;
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
    // Check KYC status for venue owners
    const user = await User.findById(req.user.id);
    if (user.role === 'venue_owner' && user.kycStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Your account must be KYC verified before you can list a venue. Please complete verification in your profile.',
      });
    }

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
    if (req.body.address || req.body.city || req.body.state || req.body.latitude || req.body.longitude) {
      const currentLocation = venue.location || {};
      const currentCoords = currentLocation.coordinates || {};

      req.body.location = {
        address: req.body.address || currentLocation.address,
        city: req.body.city || currentLocation.city,
        state: req.body.state || currentLocation.state,
        zipCode: req.body.zipCode || currentLocation.zipCode,
        country: req.body.country || currentLocation.country || 'Nepal',
        coordinates: {
          latitude: req.body.latitude || currentCoords.latitude,
          longitude: req.body.longitude || currentCoords.longitude
        }
      };
    }

    // Handle image uploads
    if (req.files && req.files.venueImages) {
      const newImagesPaths = req.files.venueImages.map(
        (file) => `/uploads/venues/${file.filename}`
      );
      
      // If req.body.images is provided as existing images by frontend, use it.
      // Otherwise default to current venue images.
      let existingImages = [];
      if (req.body.images) {
        existingImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      } else {
        existingImages = venue.images || [];
      }

      req.body.images = [...existingImages, ...newImagesPaths];
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
      status: { $in: ['pending', 'confirmed', 'completed'] },
    });

    // Filter available slots
    const availableSlots = venue.timeSlots.filter((slot) => {
      // OVERLAP CHECK: If a booking starts before slot ends AND ends after slot starts
      const isBooked = existingBookings.some(
        (booking) =>
          booking.startTime < slot.endTime && booking.endTime > slot.startTime
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
    const venues = await Venue.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'venue',
          as: 'venueBookings'
        }
      },
      {
        $addFields: {
          totalBookings: { $size: '$venueBookings' }
        }
      },
      { $sort: { createdAt: -1 } },
      { $project: { venueBookings: 0 } } // Remove the array of bookings to save bandwidth
    ]);

    res.status(200).json({
      success: true,
      count: venues.length,
      data: venues,
    });
  } catch (error) {
    next(error);
  }
};

