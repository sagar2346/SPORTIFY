const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadKycDocument, getKycStatus } = require('../controllers/kycController');
const { protect } = require('../middleware/auth');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/kyc/');
    },
    filename: function (req, file, cb) {
        cb(null, `kyc-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png) and PDFs are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter,
});

router.use(protect);

router.post(
    '/upload',
    upload.fields([
        { name: 'document', maxCount: 1 },
        { name: 'front', maxCount: 1 },
        { name: 'back', maxCount: 1 },
        { name: 'photo', maxCount: 1 }
    ]),
    uploadKycDocument
);
router.get('/status', getKycStatus);

module.exports = router;
