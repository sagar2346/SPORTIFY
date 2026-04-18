const express = require('express');
const router = express.Router();
const {
    uploadFootage,
    getAllFootage,
    queryFootage,
    getFootageSummary,
    deleteFootage,
    exportFootageReport,
} = require('../controllers/footageController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getAllFootage)
    .post(authorize('admin'), uploadFootage);

router.post('/:id/query', queryFootage);
router.get('/:id/summary', getFootageSummary);
router.post('/:id/export', exportFootageReport);
router.delete('/:id', authorize('admin'), deleteFootage);

module.exports = router;
