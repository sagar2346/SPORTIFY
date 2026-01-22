const express = require('express');
const router = express.Router();
const {
    uploadFootage,
    getAllFootage,
    queryFootage,
    deleteFootage,
} = require('../controllers/footageController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getAllFootage)
    .post(authorize('admin'), uploadFootage);

router.route('/:id')
    .post(queryFootage)
    .delete(authorize('admin'), deleteFootage);

module.exports = router;
