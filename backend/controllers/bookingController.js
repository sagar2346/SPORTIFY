const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const Team = require('../models/Team');
const DiscountCode = require('../models/DiscountCode');
const { calculatePrice } = require('../utils/pricing');
const { sendBookingConfirmation } = require('../utils/email');
const { generateQRCode, generateTicketPDF } = require('../utils/ticket');
const path = require('path');
const fs = require('fs');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { venueId, bookingDate, startTime, endTime, numberOfPlayers, discountCode, teamId } = req.body;

    // If booking for a team, check if team is blocked
    if (teamId) {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ success: false, message: 'Team not found' });
      }
      if (team.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your team is blocked from making bookings. Please check your fine status.',
        });
      }
    }

    // Check venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    // Check availability (Overlapping check)
    const bookingDateObj = new Date(bookingDate);
    // Use a more robust check for time overlaps
    const existingBooking = await Booking.findOne({
      venue: venueId,
      bookingDate: bookingDateObj,
      status: { $in: ['pending', 'confirmed', 'completed'] },
      $or: [
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } }
          ]
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked',
      });
    }

    // Calculate price
    let discount = { code: null, amount: 0 };
    if (discountCode) {
      const code = await DiscountCode.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });

      if (code) {
        if (code.usageLimit && code.usedCount >= code.usageLimit) {
          return res.status(400).json({
            success: false,
            message: 'Discount code has reached usage limit',
          });
        }

        if (
          code.applicableVenues.length > 0 &&
          !code.applicableVenues.includes(venueId)
        ) {
          return res.status(400).json({
            success: false,
            message: 'Discount code not applicable for this venue',
          });
        }

        const basePrice = await calculatePrice(venue, bookingDateObj, startTime, endTime);
        if (basePrice >= code.minPurchase) {
          if (code.type === 'percentage') {
            discount.amount = (basePrice * code.value) / 100;
            if (code.maxDiscount) {
              discount.amount = Math.min(discount.amount, code.maxDiscount);
            }
          } else {
            discount.amount = code.value;
          }
          discount.code = code.code;
        }
      }
    }

    const basePrice = await calculatePrice(venue, bookingDateObj, startTime, endTime);
    const totalPrice = basePrice - discount.amount;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      venue: venueId,
      bookingDate: bookingDateObj,
      startTime,
      endTime,
      numberOfPlayers: numberOfPlayers || 1,
      basePrice,
      totalPrice,
      discount,
      team: teamId || null,
    });

    // Populate venue details
    await booking.populate('venue', 'name images location owner');

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    let query = {};

    // Filter by user role
    if (req.user.role === 'customer') {
      query.user = req.user._id;
    } else if (req.user.role === 'venue_owner') {
      const venues = await Venue.find({ owner: req.user._id });
      const venueIds = venues.map((v) => v._id);
      query = {
        $or: [
          { venue: { $in: venueIds } },
          { user: req.user._id }
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

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('venue')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'venue_owner'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request payment verification
// @route   PUT /api/bookings/:id/verify-payment
// @access  Private
exports.requestPaymentVerification = async (req, res, next) => {
  try {
    const { method } = req.body; // 'esewa' or 'bank_transfer'
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is already processed' });
    }

    booking.payment.status = 'verification_pending';
    booking.payment.method = method || 'esewa'; // Default to esewa if not provided
    booking.payment.paidAt = new Date(); // Timestamp of user claim

    await booking.save();

    // Notify Admins
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      updateOne: {
        filter: { _id: admin._id },
        update: {
          $push: {
            notifications: {
              type: 'payment_verification',
              message: `New payment verification request for Booking ${booking._id.toString().slice(-6)}`,
              bookingId: booking._id
            }
          }
        }
      }
    }));

    if (notifications.length > 0) {
      await User.bulkWrite(notifications);
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Payment verification requested'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking (after payment)
// @route   PUT /api/bookings/:id/confirm
// @access  Private (Admin/Owner)
exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('venue user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization (Must be owner of the venue or admin)
    if (booking.venue.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this booking',
      });
    }

    // Allow confirming if status is pending OR verification_pending
    if (booking.status !== 'pending' && booking.payment.status !== 'verification_pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already processed or not pending verification',
      });
    }

    // Generate QR code
    const qrCode = await generateQRCode(booking._id.toString());

    // Generate PDF ticket
    const pdfUrl = await generateTicketPDF(booking);

    booking.status = 'confirmed';
    booking.payment.status = 'paid';
    // booking.payment.paidAt = new Date(); // Keep the original user claim time or update
    booking.ticket.qrCode = qrCode;
    booking.ticket.pdfUrl = pdfUrl;

    await booking.save();

    // Robust Loyalty Point Awarding (5% of booking price)
    try {
      const price = Number(booking.totalPrice) || 0;
      const pointsAwarded = Math.round(price * 0.05 * 100) / 100;
      
      // Use booking.user directly if it's an ID, or booking.user._id if it's populated
      const userId = booking.user._id || booking.user;

      if (userId && pointsAwarded > 0) {
        console.log(`[Loyalty System] Awarding ${pointsAwarded} points to User ${userId} for Booking ${booking._id}`);
        
        await User.findByIdAndUpdate(userId, {
          $inc: { loyaltyPoints: pointsAwarded }
        });
      } else {
        console.warn(`[Loyalty System] Skipping award. Points: ${pointsAwarded}, UserID found: ${!!userId}`);
      }
    } catch (ptsError) {
      console.error('[Loyalty System] ERROR awarding points:', ptsError.message);
    }

    // Send confirmation email
    try {
      await sendBookingConfirmation(booking);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    // Add notification
    try {
      await User.findByIdAndUpdate(booking.user._id, {
        $push: {
          notifications: {
            type: 'booking',
            message: `Your booking at ${booking.venue?.name || 'the venue'} has been confirmed!`,
          },
        },
      });
    } catch (notifError) {
      console.error('Notification failed:', notifError);
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('venue user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    const { reason } = req.body;

    booking.status = 'cancelled';
    booking.cancellation.requestedAt = new Date();
    booking.cancellation.reason = reason;

    // Calculate refund (if paid)
    if (booking.payment.status === 'paid') {
      // Refund policy: 100% if cancelled 24+ hours before, 50% if less
      const hoursUntilBooking = (booking.bookingDate - new Date()) / (1000 * 60 * 60);
      if (hoursUntilBooking >= 24) {
        booking.cancellation.refundAmount = booking.totalPrice;
      } else {
        booking.cancellation.refundAmount = booking.totalPrice * 0.5;
      }
      booking.cancellation.refundStatus = 'pending';
    } else if (booking.payment.status === 'verification_pending') {
      // If cancelling while under review (e.g. Admin Reject), mark payment as failed
      booking.payment.status = 'failed';
    }

    await booking.save();

    // Add notification
    await User.findByIdAndUpdate(booking.user._id, {
      $push: {
        notifications: {
          type: 'booking',
          message: `Your booking at ${booking.venue?.name || 'the venue'} has been cancelled.`,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
exports.rescheduleBooking = async (req, res, next) => {
  try {
    const { bookingDate, startTime, endTime } = req.body;

    const booking = await Booking.findById(req.params.id).populate('venue');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule a cancelled booking',
      });
    }

    // Check new slot availability
    const bookingDateObj = new Date(bookingDate);
    const existingBooking = await Booking.findOne({
      venue: booking.venue._id,
      bookingDate: bookingDateObj,
      startTime,
      endTime,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: booking._id },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked',
      });
    }

    // Recalculate price if date changed
    const venue = await Venue.findById(booking.venue._id);
    const newBasePrice = await calculatePrice(venue, bookingDateObj, startTime, endTime);
    const newTotalPrice = newBasePrice - booking.discount.amount;

    booking.bookingDate = bookingDateObj;
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.basePrice = newBasePrice;
    booking.totalPrice = newTotalPrice;
    booking.updatedAt = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay for booking using wallet balance
// @route   PUT /api/bookings/:id/pay-wallet
// @access  Private
exports.payWithWallet = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('venue user');
    const user = await User.findById(req.user.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is already processed' });
    }

    if (user.walletBalance < booking.totalPrice) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You have रू ${user.walletBalance.toLocaleString()} but need रू ${booking.totalPrice.toLocaleString()}.`,
      });
    }

    // Deduct from wallet
    user.walletBalance -= booking.totalPrice;
    await user.save();

    // Confirm booking logic
    const { generateQRCode, generateTicketPDF } = require('../utils/ticket');
    const { sendBookingConfirmation } = require('../utils/email');

    const qrCode = await generateQRCode(booking._id.toString());
    const pdfUrl = await generateTicketPDF(booking);

    booking.status = 'confirmed';
    booking.payment.status = 'paid';
    booking.payment.method = 'wallet';
    booking.payment.paidAt = new Date();
    booking.ticket.qrCode = qrCode;
    booking.ticket.pdfUrl = pdfUrl;

    await booking.save();

    // Robust Loyalty Point Awarding (5% of booking price)
    try {
      const price = Number(booking.totalPrice) || 0;
      const pointsAwarded = Math.round(price * 0.05 * 100) / 100;

      if (user._id && pointsAwarded > 0) {
        console.log(`[Loyalty System] Awarding ${pointsAwarded} points to User ${user._id} for WALLET Booking ${booking._id}`);
        
        await User.findByIdAndUpdate(user._id, {
          $inc: { loyaltyPoints: pointsAwarded }
        });
      } else {
        console.warn(`[Loyalty System] Skipping wallet award. Points: ${pointsAwarded}`);
      }
    } catch (ptsError) {
      console.error('[Loyalty System] ERROR awarding points (Wallet):', ptsError.message);
    }

    // Send confirmation email
    try {
      await sendBookingConfirmation(booking);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    // Add notification
    try {
      await User.findByIdAndUpdate(user._id, {
        $push: {
          notifications: {
            type: 'booking',
            message: `Your booking at ${booking.venue?.name} has been paid via Wallet and confirmed!`,
          },
        },
      });
    } catch (notifError) {
      console.error('Notification failed:', notifError);
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Payment successful using wallet'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking (Admin only)
// @route   DELETE /api/bookings/:id
// @access  Private (Admin)
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Only admin can hard delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete booking',
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Download ticket PDF
// @route   GET /api/bookings/:id/download
// @access  Private/Public
exports.downloadTicket = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if ticket exists
    if (!booking.ticket || !booking.ticket.pdfUrl) {
      return res.status(400).json({
        success: false,
        message: 'Ticket not yet generated for this booking. It must be confirmed first.',
      });
    }

    const pdfPath = path.join(__dirname, '..', booking.ticket.pdfUrl);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Ticket file not found on server.',
      });
    }

    res.download(pdfPath, `ticket-${booking._id}.pdf`);
  } catch (error) {
    next(error);
  }
};
