const mongoose = require('mongoose');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Team = require('../models/Team');
const Review = require('../models/Review');

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
    let query = { user: req.user._id };

    // If owner, also show bookings for their venues
    if (req.user.role === 'venue_owner') {
      const venues = await Venue.find({ owner: req.user._id });
      const venueIds = venues.map((v) => v._id);
      query = {
        $or: [
          { user: req.user._id },
          { venue: { $in: venueIds } }
        ]
      };
    }

    const bookings = await Booking.find(query)
      .populate('venue', 'name images location')
      .populate('user', 'name email')
      .sort({ bookingDate: -1, createdAt: -1 });

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
      const userId = new mongoose.Types.ObjectId(user._id);

      const totalBookings = await Booking.countDocuments({ user: userId });
      const completedBookings = await Booking.countDocuments({
        user: userId,
        status: 'completed',
      });

      const totalSpentResult = await Booking.aggregate([
        { $match: { user: userId, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]);


      const teamsJoined = await Team.countDocuments({ 'members.user': userId });

      const sportStats = await Booking.aggregate([
        { $match: { user: userId } },
        { $lookup: { from: 'venues', localField: 'venue', foreignField: '_id', as: 'venueData' } },
        { $unwind: { path: '$venueData', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$venueData.sportTypes', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$venueData.sportTypes', count: { $sum: 1 } } },
        { $match: { _id: { $ne: null } } },
        { $sort: { count: -1 } }
      ]);

      const favoriteSport = sportStats.length > 0 ? sportStats[0]._id : 'None';

      // Weekly Stats (last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const weeklyStatsRaw = await Booking.aggregate([
        {
          $match: {
            user: userId,
            'payment.status': 'paid',
            createdAt: { $gte: lastWeek }
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            count: { $sum: 1 }
          }
        }
      ]);

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyStats = days.map((day, index) => {
        const stat = weeklyStatsRaw.find(s => s._id === index + 1);
        return { name: day, bookings: stat ? stat.count : 0 };
      });

      // Shift weeklyStats so it starts from 7 days ago until today
      const today = new Date().getDay();
      const orderedWeeklyStats = [];
      for (let i = 6; i >= 0; i--) {
        const dayIdx = (today - i + 7) % 7;
        orderedWeeklyStats.push(weeklyStats[dayIdx]);
      }

      // Sport Distribution
      const sportDistribution = sportStats.map(s => ({
        name: s._id,
        value: s.count
      }));

      res.status(200).json({
        success: true,
        data: {
          totalBookings,
          completedBookings,
          totalSpent: totalSpentResult[0]?.total || 0,
          teamsJoined,
          favoriteSport,
          weeklyStats: orderedWeeklyStats,
          sportDistribution
        },
      });
    } else if (user.role === 'venue_owner') {
      const venues = await Venue.find({ owner: user._id });
      const venueIds = venues.map((v) => v._id);

      const totalBookings = await Booking.countDocuments({
        venue: { $in: venueIds },
      });
      const totalRevenueResult = await Booking.aggregate([
        { $match: { venue: { $in: venueIds }, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]);
      const totalRevenue = totalRevenueResult[0]?.total || 0;

      // Monthly Revenue (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const monthlyRevenueRaw = await Booking.aggregate([
        {
          $match: {
            venue: { $in: venueIds },
            'payment.status': 'paid',
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            revenue: { $sum: '$totalPrice' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const stat = monthlyRevenueRaw.find(s => s._id.month === m && s._id.year === y);
        monthlyRevenue.push({
          name: monthNames[m - 1],
          revenue: stat ? stat.revenue : 0
        });
      }

      // Weekly Activity (last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const weeklyActivityRaw = await Booking.aggregate([
        {
          $match: {
            venue: { $in: venueIds },
            'payment.status': 'paid',
            createdAt: { $gte: lastWeek }
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            count: { $sum: 1 }
          }
        }
      ]);

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyActivity = days.map((day, index) => {
        const stat = weeklyActivityRaw.find(s => s._id === index + 1);
        return { name: day, bookings: stat ? stat.count : 0 };
      });

      // Shift weeklyActivity so it starts from 7 days ago until today
      const today = new Date().getDay();
      const orderedWeeklyActivity = [];
      for (let i = 6; i >= 0; i--) {
        const dayIdx = (today - i + 7) % 7;
        orderedWeeklyActivity.push(weeklyActivity[dayIdx]);
      }

      // Venue Performance
      const venuePerformance = await Booking.aggregate([
        { $match: { venue: { $in: venueIds } } },
        {
          $group: {
            _id: '$venue',
            bookings: { $sum: 1 },
            revenue: {
              $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, '$totalPrice', 0] }
            }
          }
        },
        { $lookup: { from: 'venues', localField: '_id', foreignField: '_id', as: 'venueInfo' } },
        { $unwind: '$venueInfo' },
        {
          $project: {
            name: '$venueInfo.name',
            bookings: 1,
            revenue: 1
          }
        }
      ]);

      // Review Distribution
      const reviewDistributionRaw = await Review.aggregate([
        { $match: { venue: { $in: venueIds } } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      const reviewDistribution = [1, 2, 3, 4, 5].map(r => {
        const stat = reviewDistributionRaw.find(s => s._id === r);
        return { rating: r, count: stat ? stat.count : 0 };
      });

      // Sport Distribution
      const sportDistribution = await Booking.aggregate([
        { $match: { venue: { $in: venueIds } } },
        { $lookup: { from: 'venues', localField: 'venue', foreignField: '_id', as: 'venueData' } },
        { $unwind: '$venueData' },
        { $unwind: '$venueData.sportTypes' },
        { $group: { _id: '$venueData.sportTypes', value: { $sum: 1 } } },
        { $project: { name: '$_id', value: 1, _id: 0 } }
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalVenues: venues.length,
          totalBookings,
          totalRevenue,
          monthlyRevenue,
          weeklyActivity: orderedWeeklyActivity,
          venuePerformance,
          reviewDistribution,
          sportDistribution
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
    
    let errorMessage = 'Failed to send email. Check server logs for details.';
    if (error.code === 'EAUTH') {
      errorMessage = 'Invalid email configuration or credentials. Please check your SMTP settings in .env.';
    }

    res.status(500).json({
      success: false,
      message: errorMessage + ' (' + error.message + ')',
    });
  }
};

// @desc    Redeem loyalty points to wallet balance
// @route   POST /api/users/redeem-points
// @access  Private
exports.redeemLoyaltyPoints = async (req, res, next) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user.id);

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid number of points to redeem',
      });
    }

    if (user.loyaltyPoints < points) {
      return res.status(400).json({
        success: false,
        message: `Insufficient loyalty points. You have ${user.loyaltyPoints} points.`,
      });
    }

    // Conversion: 1 Point = 1 USD. $1 = 130 NPR (Assuming base currency is NPR)
    const CONVERSION_RATE = 130;
    const walletCredit = points * CONVERSION_RATE;

    user.loyaltyPoints -= points;
    user.walletBalance += walletCredit;

    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully redeemed ${points} points for रू ${walletCredit.toLocaleString()}`,
      data: {
        loyaltyPoints: user.loyaltyPoints,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};
