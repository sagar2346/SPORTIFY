const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getUserBookings,
  getNotifications,
  markNotificationRead,
  getUserAnalytics,
  addContact,
  getContacts,
  sendContactEmail,
  markAllNotificationsRead
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', upload.single('avatar'), updateProfile);
router.get('/bookings', getUserBookings);
router.get('/notifications', getNotifications);
router.put('/notifications/:notificationId', markNotificationRead);
router.put('/notifications/read-all/mark', markAllNotificationsRead); // Changed path to avoid conflict with :notificationId
router.get('/analytics', getUserAnalytics);

// Wishlist routes
router.get('/wishlist', getWishlist);
router.post('/wishlist/:venueId', addToWishlist);
router.delete('/wishlist/:venueId', removeFromWishlist);

// Contact/Friend routes
router.get('/contacts', getContacts);
router.post('/contacts', addContact);
router.post('/contacts/email', sendContactEmail);

module.exports = router;

