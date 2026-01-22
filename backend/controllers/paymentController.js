const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('venue');

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

    if (booking.payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid',
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.bookingId;

    const booking = await Booking.findById(bookingId).populate('venue user');
    if (booking) {
      booking.payment.status = 'paid';
      booking.payment.transactionId = paymentIntent.id;
      booking.payment.paidAt = new Date();
      booking.status = 'confirmed';
      
      // Generate QR code and PDF ticket
      const { generateQRCode, generateTicketPDF } = require('../utils/ticket');
      const { sendBookingConfirmation } = require('../utils/email');
      
      try {
        booking.ticket.qrCode = await generateQRCode(booking._id.toString());
        booking.ticket.pdfUrl = await generateTicketPDF(booking);
        await booking.save();
        
        // Send confirmation email
        await sendBookingConfirmation(booking);
      } catch (error) {
        console.error('Error processing booking confirmation:', error);
      }
    }
  }

  res.json({ received: true });
};

// @desc    Get payment status
// @route   GET /api/payments/status/:bookingId
// @access  Private
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

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

    res.status(200).json({
      success: true,
      data: {
        status: booking.payment.status,
        amount: booking.totalPrice,
        transactionId: booking.payment.transactionId,
        paidAt: booking.payment.paidAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

