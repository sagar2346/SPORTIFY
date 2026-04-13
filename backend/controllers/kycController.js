const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Upload KYC documents (Business Doc, Owner ID Front, Back, and Passport Photo)
// @route   POST /api/kyc/upload
// @access  Private (Venue Owner Only)
exports.uploadKycDocument = async (req, res, next) => {
    try {
        if (req.user.role !== 'venue_owner') {
            return res.status(403).json({
                success: false,
                message: 'Only venue owners (partners) are required to complete KYC verification',
            });
        }

        if (!req.files || !req.files.document || !req.files.front || !req.files.back || !req.files.photo) {
            return res.status(400).json({
                success: false,
                message: 'Please upload business document, owner ID (front & back), and passport photo',
            });
        }

        const { identificationNumber } = req.body;
        const user = await User.findById(req.user.id);

        // Update user fields
        user.kycBusinessDocument = `/uploads/kyc/${req.files.document[0].filename}`;
        user.kycOwnerIdFront = `/uploads/kyc/${req.files.front[0].filename}`;
        user.kycOwnerIdBack = `/uploads/kyc/${req.files.back[0].filename}`;
        user.kycPassportPhoto = `/uploads/kyc/${req.files.photo[0].filename}`;
        user.kycIdentificationNumber = identificationNumber || '';
        user.kycStatus = 'pending';
        user.kycSubmittedAt = Date.now();

        await user.save();

        res.status(200).json({
            success: true,
            message: 'KYC documents uploaded successfully. Verification is pending.',
            data: {
                kycStatus: user.kycStatus,
                kycBusinessDocument: user.kycBusinessDocument,
                kycOwnerIdFront: user.kycOwnerIdFront,
                kycOwnerIdBack: user.kycOwnerIdBack,
                kycPassportPhoto: user.kycPassportPhoto,
                kycIdentificationNumber: user.kycIdentificationNumber,
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
