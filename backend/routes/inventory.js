const express = require('express');
const {
    getInventory,
    addItem,
    updateItem,
    deleteItem,
} = require('../controllers/inventoryController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes are protected and restricted to venue_owner (and admin if needed)
router.use(protect);
router.use(authorize('venue_owner', 'admin'));

router
    .route('/')
    .get(getInventory)
    .post(addItem);

router
    .route('/:id')
    .put(updateItem)
    .delete(deleteItem);

module.exports = router;
