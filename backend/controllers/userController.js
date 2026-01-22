const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Team = require('../models/Team');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
    };

    if (req.body.address) {
      try {
        // If address is sent as string (from FormData), parse it
        fieldsToUpdate.address = typeof req.body.address === 'string'
          ? JSON.parse(req.body.address)
          : req.body.address;
      } catch (e) {
        console.error('Error parsing address:', e);
        // Fallback or keep as is if it fails, though it should be an object structure
        fieldsToUpdate.address = req.body.address;
      }
    }

    if (req.file) {
      fieldsToUpdate.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add venue to wishlist
// @route   POST /api/users/wishlist/:venueId
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.wishlist.includes(req.params.venueId)) {
      return res.status(400).json({
        success: false,
        message: 'Venue already in wishlist',
      });
    }

    user.wishlist.push(req.params.venueId);
    await user.save();

    res.status(200).json({
      success: true,
      data: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove venue from wishlist
// @route   DELETE /api/users/wishlist/:venueId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.venueId
    );
    await user.save();

    res.status(200).json({
      success: true,
      data: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');

    res.status(200).json({
      success: true,
      data: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('venue', 'name images location')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:notificationId
// @access  Private
exports.markNotificationRead = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const notification = user.notifications.id(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.read = true;
    await user.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark ALL notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Mark all as read
    user.notifications.forEach(n => {
      n.read = true;
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: user.notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user analytics
// @route   GET /api/users/analytics
// @access  Private
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role === 'customer') {
      const totalBookings = await Booking.countDocuments({ user: user.id });
      const completedBookings = await Booking.countDocuments({
        user: user.id,
        status: 'completed',
      });

      const totalSpentResult = await Booking.aggregate([
        { $match: { user: user._id, status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]);


      const teamsJoined = await Team.countDocuments({ members: user.id });

      // Calculate favorite sport based on bookings
      const sportStats = await Booking.aggregate([
        { $match: { user: user._id } },
        { $lookup: { from: 'venues', localField: 'venue', foreignField: '_id', as: 'venueData' } },
        { $unwind: '$venueData' },
        { $unwind: '$venueData.sportTypes' },
        { $group: { _id: '$venueData.sportTypes', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);

      const favoriteSport = sportStats.length > 0 ? sportStats[0]._id : 'None';


      res.status(200).json({
        success: true,
        data: {
          totalBookings,
          completedBookings,
          totalSpent: totalSpentResult[0]?.total || 0,
          teamsJoined,
          favoriteSport
        },
      });
    } else if (user.role === 'venue_owner') {
      const venues = await Venue.find({ owner: user.id });
      const venueIds = venues.map((v) => v._id);

      const totalBookings = await Booking.countDocuments({
        venue: { $in: venueIds },
      });
      const totalRevenue = await Booking.aggregate([
        { $match: { venue: { $in: venueIds }, payment: { status: 'paid' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalVenues: venues.length,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
      });
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add a contact (friend)
// @route   POST /api/users/contacts
// @access  Private
exports.addContact = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    // Initialize contacts if undefined
    if (!user.contacts) {
      user.contacts = [];
    }

    // Check if email already exists in contacts
    if (user.contacts.some(c => c.email === email)) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this email already exists',
      });
    }

    user.contacts.push({ name, email });
    await user.save();

    res.status(200).json({
      success: true,
      data: user.contacts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contacts
// @route   GET /api/users/contacts
// @access  Private
exports.getContacts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.contacts || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send email to a contact
// @route   POST /api/users/contacts/email
// @access  Private
exports.sendContactEmail = async (req, res, next) => {
  try {
    const { email, subject, message } = req.body;
    const user = req.user;

    const emailService = require('../utils/email');
    await emailService.sendFriendMessage(user, email, subject, message);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Send Contact Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email. check server logs for details. ' + error.message,
    });
  }
};
