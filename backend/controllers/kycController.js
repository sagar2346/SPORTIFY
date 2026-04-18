const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Upload KYC documents (Front, Back, and Passport Photo)
// @route   POST /api/kyc/upload
// @access  Private
exports.uploadKycDocument = async (req, res, next) => {
    try {
        if (!req.files || !req.files.front || !req.files.back || !req.files.photo) {
            return res.status(400).json({
                success: false,
                message: 'Please upload front citizenship, back citizenship, and your passport photo',
            });
        }

        const user = await User.findById(req.user.id);

        // Update user fields
        user.kycDocumentFront = `/uploads/kyc/${req.files.front[0].filename}`;
        user.kycDocumentBack = `/uploads/kyc/${req.files.back[0].filename}`;
        user.kycPassportPhoto = `/uploads/kyc/${req.files.photo[0].filename}`;
        user.kycStatus = 'pending';
        user.kycSubmittedAt = Date.now();

        await user.save();

        res.status(200).json({
            success: true,
            message: 'KYC documents uploaded successfully. Verification is pending.',
            data: {
                kycStatus: user.kycStatus,
                kycDocumentFront: user.kycDocumentFront,
                kycDocumentBack: user.kycDocumentBack,
                kycPassportPhoto: user.kycPassportPhoto,
                kycSubmittedAt: user.kycSubmittedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get KYC status
// @route   GET /api/kyc/status
// @access  Private
exports.getKycStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('kycStatus kycDocumentFront kycDocumentBack kycPassportPhoto kycSubmittedAt kycRejectionReason');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};
