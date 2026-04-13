const express = require('express');
const router = express.Router();
const {
    uploadFootage,
    getAllFootage,
    getFootage,
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

router
    .route('/:id')
    .get(getFootage)
    .delete(authorize('admin'), deleteFootage);

router.post('/:id/query', queryFootage);
router.get('/:id/summary', getFootageSummary);
router.post('/:id/export', exportFootageReport);

module.exports = router;
