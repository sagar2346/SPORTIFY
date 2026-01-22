const Footage = require('../models/Footage');
const { analyzeGameFootage } = require('../utils/gemini');

// @desc    Upload game footage
// @route   POST /api/footage
// @access  Private (Admin)
exports.uploadFootage = async (req, res, next) => {
    try {
        req.body.uploadedBy = req.user.id;
        const footage = await Footage.create(req.body);
        res.status(201).json({ success: true, data: footage });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all game footage
// @route   GET /api/footage
// @access  Private
exports.getAllFootage = async (req, res, next) => {
    try {
        const footage = await Footage.find().sort('-createdAt');
        res.status(200).json({ success: true, data: footage });
    } catch (error) {
        next(error);
    }
};

// @desc    Query footage with AI
// @route   POST /api/footage/:id/query
// @access  Private
exports.queryFootage = async (req, res, next) => {
    try {
        const footage = await Footage.findById(req.params.id);
        if (!footage) {
            return res.status(404).json({ success: false, message: 'Footage not found' });
        }

        const { question } = req.body;
        console.log(`🤖 AI Query for footage: ${footage.title}`);

        try {
            // Use real Gemini AI for analysis
            const reply = await analyzeGameFootage(footage.title, footage.analysisText, footage.description, question);
            res.status(200).json({ success: true, reply });
        } catch (aiError) {
            console.error('❌ AI Analysis Error:', aiError);
            res.status(500).json({ success: false, message: 'AI failed to respond. Please check server logs.' });
        }
    } catch (error) {
        console.error('❌ Controller Error:', error);
        next(error);
    }
};

// @desc    Delete game footage
// @route   DELETE /api/footage/:id
// @access  Private (Admin)
exports.deleteFootage = async (req, res, next) => {
    try {
        const footage = await Footage.findById(req.params.id);

        if (!footage) {
            return res.status(404).json({ success: false, message: 'Footage not found' });
        }

        await footage.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// Removed simulation helper (now using gemini utility)

