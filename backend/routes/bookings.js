const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  confirmBooking,
  cancelBooking,
  deleteBooking,
  rescheduleBooking,
  requestPaymentVerification,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBooking);
router.put('/:id/confirm', confirmBooking);
router.put('/:id/verify-payment', requestPaymentVerification);
router.put('/:id/cancel', cancelBooking);
router.delete('/:id', deleteBooking);
router.put('/:id/reschedule', rescheduleBooking);

module.exports = router;

