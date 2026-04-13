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
  downloadTicket,
  payWithWallet,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.get('/:id/download', (req, res, next) => {
  // Public-ish access for download (or just protect it if needed)
  return downloadTicket(req, res, next);
});

router.use(protect);

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBooking);
router.put('/:id/confirm', confirmBooking);
router.put('/:id/verify-payment', requestPaymentVerification);
router.put('/:id/cancel', cancelBooking);
router.delete('/:id', deleteBooking);
router.put('/:id/reschedule', rescheduleBooking);
router.put('/:id/pay-wallet', payWithWallet);

module.exports = router;

