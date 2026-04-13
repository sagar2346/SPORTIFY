const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');
const TournamentRegistration = require('../models/TournamentRegistration');

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

const crypto = require('crypto');
const ESEWA_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const SECRET_KEY = "8gBm/:&EnhH.1/q";
const MERCHANT_CODE = "EPAYTEST";

function generateEsewaSignature(total_amount, transaction_uuid, product_code, secret) {
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('base64');
}

// @desc    Initiate eSewa payment
// @route   POST /api/payments/esewa/initiate
// @access  Private
exports.initiateEsewaPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('venue');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    const amount = booking.totalPrice;
    const tax_amount = 0;
    const total_amount = (amount + tax_amount).toString();
    const transaction_uuid = booking._id.toString();
    const product_code = MERCHANT_CODE;
    
    const signature = generateEsewaSignature(total_amount, transaction_uuid, product_code, SECRET_KEY);

    // Provide form data to react frontend
    res.status(200).json({
      success: true,
      formData: {
        amount,
        tax_amount,
        total_amount,
        transaction_uuid,
        product_code,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `http://localhost:3000/payment/esewa/success`, // React route
        failure_url: `http://localhost:3000/payment/esewa/failure`, // React route
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature
      },
      esewaUrl: ESEWA_URL
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate eSewa payment for team fine
// @route   POST /api/payments/esewa/initiate-fine
// @access  Private
exports.initiateEsewaFinePayment = async (req, res, next) => {
  try {
    const { teamId } = req.body;
    console.log('Initiating fine payment for team:', teamId, 'by user:', req.user.id);
    const team = await Team.findById(teamId);

    if (!team) {
      console.log('Team not found:', teamId);
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const isMember = team.members.some(member => {
      const memberId = member.user && (member.user._id || member.user);
      return memberId && memberId.toString() === req.user.id;
    });

    console.log('Is user member of team?', isMember);
    if (!isMember) {
      console.log('User not authorized.');
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!team.isBlocked || team.fineAmount <= 0) {
      return res.status(400).json({ success: false, message: 'No fine to pay' });
    }

    const amount = team.fineAmount;
    const tax_amount = 0;
    const total_amount = (amount + tax_amount).toString();
    const transaction_uuid = `FINE_${team._id.toString()}_${Date.now()}`;
    const product_code = MERCHANT_CODE;
    
    const signature = generateEsewaSignature(total_amount, transaction_uuid, product_code, SECRET_KEY);

    res.status(200).json({
      success: true,
      formData: {
        amount,
        tax_amount,
        total_amount,
        transaction_uuid,
        product_code,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `http://localhost:3000/payment/esewa/success`, 
        failure_url: `http://localhost:3000/payment/esewa/failure`, 
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature
      },
      esewaUrl: ESEWA_URL
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate eSewa payment for tournament registration
// @route   POST /api/payments/esewa/initiate-tournament
// @access  Private
exports.initiateEsewaTournamentPayment = async (req, res, next) => {
  try {
    const { registrationId } = req.body;
    const registration = await TournamentRegistration.findById(registrationId).populate('tournament');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.registeredBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Registration is already paid' });
    }

    const amount = registration.tournament.entryFee;
    const tax_amount = 0;
    const total_amount = (amount + tax_amount).toString();
    const transaction_uuid = `TOR_${registration._id.toString()}_${Date.now()}`;
    const product_code = MERCHANT_CODE;
    
    const signature = generateEsewaSignature(total_amount, transaction_uuid, product_code, SECRET_KEY);

    res.status(200).json({
      success: true,
      formData: {
        amount,
        tax_amount,
        total_amount,
        transaction_uuid,
        product_code,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `http://localhost:3000/payment/esewa/success`, 
        failure_url: `http://localhost:3000/payment/esewa/failure`, 
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature
      },
      esewaUrl: ESEWA_URL
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify eSewa Payment Callback
// @route   POST /api/payments/esewa/verify
// @access  Private
exports.verifyEsewaPayment = async (req, res, next) => {
  try {
    const { data } = req.body; // The base64 data sent by eSewa to frontend
    if (!data) {
      return res.status(400).json({ success: false, message: 'Missing payment data' });
    }

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const parsedData = JSON.parse(decodedData);

    if (parsedData.status !== 'COMPLETE') {
      return res.status(400).json({ success: false, message: 'Payment was not completed successfully' });
    }

    const transaction_uuid = parsedData.transaction_uuid;
    
    // Handle Team Fine Payment
    if (transaction_uuid.startsWith('FINE_')) {
      const parts = transaction_uuid.split('_');
      const teamId = parts[1];
      const team = await Team.findById(teamId);

      if (!team) {
        return res.status(404).json({ success: false, message: 'Team not found' });
      }

      team.isBlocked = false;
      team.fineAmount = 0;
      team.finePaymentStatus = 'paid';
      team.finePaymentMethod = 'esewa';
      await team.save();

      return res.status(200).json({ 
        success: true, 
        message: 'Fine paid and team unblocked', 
        type: 'fine', 
        teamId: team._id 
      });
    }

    // Handle Tournament Payment
    if (transaction_uuid.startsWith('TOR_')) {
      const parts = transaction_uuid.split('_');
      const registrationId = parts[1];
      const registration = await TournamentRegistration.findById(registrationId);

      if (!registration) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }

      registration.paymentStatus = 'paid';
      registration.status = 'confirmed';
      await registration.save();

      return res.status(200).json({ 
        success: true, 
        message: 'Tournament registration paid', 
        type: 'tournament', 
        tournamentId: registration.tournament 
      });
    }

    // Handle Booking Payment
    const bookingId = transaction_uuid;
    const booking = await Booking.findById(bookingId).populate('user venue');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if not already paid
    if (booking.payment.status !== 'paid') {
      booking.payment.status = 'paid';
      booking.payment.transactionId = parsedData.transaction_code || parsedData.transaction_uuid;
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
        console.error('Error processing eSewa booking confirmation:', error);
      }
    }

    res.status(200).json({ success: true, message: 'Payment verified and booking confirmed', bookingId: booking._id });
  } catch (error) {
    next(error);
  }
};
