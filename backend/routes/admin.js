const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  approveVenueOwner,
  approveVenue,
  getAllBookings,
  createDiscountCode,
  getDiscountCodes,
  generateReports,
  deleteUser,
  updateUser,
  updateUserStatus,
  getOwnerRevenues,
  getPendingKyc,
  updateKycStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', updateUserStatus);
router.put('/approve-owner/:userId', approveVenueOwner);
router.put('/approve-venue/:venueId', approveVenue);
router.get('/bookings', getAllBookings);
router.post('/discount-codes', createDiscountCode);
router.get('/discount-codes', getDiscountCodes);
router.get('/reports', generateReports);
router.get('/revenue-by-owner', getOwnerRevenues);
router.get('/kyc/pending', getPendingKyc);
router.put('/kyc/:userId/status', updateKycStatus);

module.exports = router;
