// Admin Controller for SPORTIFY Backend
const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const DiscountCode = require('../models/DiscountCode');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVenues = await Venue.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('venue', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const pendingVenues = await Venue.find({ isApproved: false })
      .populate('owner', 'name email')
      .limit(10);

    const pendingPayments = await Booking.find({ 'payment.status': 'verification_pending' })
      .populate('user', 'name email')
      .populate('venue', 'name')
      .sort({ 'payment.paidAt': -1 });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalVenues,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        recentBookings,
        pendingVenues,
        pendingPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve venue owner
// @route   PUT /api/admin/approve-owner/:userId
// @access  Private (Admin)
exports.approveVenueOwner = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'venue_owner') {
      return res.status(400).json({
        success: false,
        message: 'User is not a venue owner',
      });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve venue
// @route   PUT /api/admin/approve-venue/:venueId
// @access  Private (Admin)
exports.approveVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.venueId);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    venue.isApproved = true;
    await venue.save();

    res.status(200).json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('venue', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create discount code
// @route   POST /api/admin/discount-codes
// @access  Private (Admin)
exports.createDiscountCode = async (req, res, next) => {
  try {
    const discountCode = await DiscountCode.create(req.body);

    res.status(201).json({
      success: true,
      data: discountCode,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all discount codes
// @route   GET /api/admin/discount-codes
// @access  Private (Admin)
exports.getDiscountCodes = async (req, res, next) => {
  try {
    const codes = await DiscountCode.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: codes.length,
      data: codes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.generateReports = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;

    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    if (type === 'bookings') {
      const bookings = await Booking.find(matchQuery)
        .populate('user', 'name email')
        .populate('venue', 'name')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        type: 'bookings',
        count: bookings.length,
        data: bookings,
      });
    } else if (type === 'revenue') {
      const revenue = await Booking.aggregate([
        { $match: { ...matchQuery, 'payment.status': 'paid' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalBookings: { $sum: 1 },
            averageBooking: { $avg: '$totalPrice' },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        type: 'revenue',
        data: revenue[0] || { totalRevenue: 0, totalBookings: 0, averageBooking: 0 },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid report type',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Simplified Admin Logic: Admin can delete anyone
    await User.findByIdAndDelete(req.params.id);
    console.log(`Admin deleted user: ${req.params.id}`);
    return res.status(200).json({ success: true, data: {} });

  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protection: Cannot update oneself to change role through this endpoint if needed, but for now allowing full access as requested
    // Removed Super Admin protection

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Removed Super Admin protection

    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status }, // Schema enum now supports 'blocked'
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue by owner
// @route   GET /api/admin/revenue-by-owner
// @access  Private (Admin)
exports.getOwnerRevenues = async (req, res, next) => {
  try {
    const ownerRevenues = await Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      {
        $lookup: {
          from: 'venues',
          localField: 'venue',
          foreignField: '_id',
          as: 'venueData'
        }
      },
      { $unwind: '$venueData' },
      {
        $group: {
          _id: '$venueData.owner',
          totalRevenue: { $sum: '$totalPrice' },
          totalBookings: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'ownerData'
        }
      },
      { $unwind: '$ownerData' },
      {
        $project: {
          _id: 1,
          name: '$ownerData.name',
          email: '$ownerData.email',
          totalRevenue: 1,
          totalBookings: 1
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: ownerRevenues.length,
      data: ownerRevenues
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending KYC requests
// @route   GET /api/admin/kyc/pending
// @access  Private (Admin)
exports.getPendingKyc = async (req, res, next) => {
  try {
    const pendingKyc = await User.find({ kycStatus: 'pending' })
      .select('name email kycStatus kycDocumentFront kycDocumentBack kycPassportPhoto kycSubmittedAt')
      .sort({ kycSubmittedAt: 1 });

    res.status(200).json({
      success: true,
      count: pendingKyc.length,
      data: pendingKyc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update KYC status
// @route   PUT /api/admin/kyc/:userId/status
// @access  Private (Admin)
exports.updateKycStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.kycStatus = status;
    if (status === 'rejected' && reason) {
      user.kycRejectionReason = reason;
    } else if (status === 'verified') {
      user.kycRejectionReason = ''; // Clear reason if verified
    }

    await user.save();

    // Notify user
    user.notifications.push({
      type: 'system',
      message: `Your KYC verification request has been ${status}. ${status === 'verified' ? 'You can now book venues.' : `Reason: ${reason || 'Please re-upload a clear document.'}`}`,
    });
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
