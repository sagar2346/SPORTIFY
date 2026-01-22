const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  handleWebhook,
  getPaymentStatus,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook must be before body parser
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.use(protect);
router.post('/create-intent', createPaymentIntent);
router.get('/status/:bookingId', getPaymentStatus);

module.exports = router;

