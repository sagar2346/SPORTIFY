const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', [
    protect,
    body('subject', 'Subject is required').not().isEmpty(),
    body('message', 'Message is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newMessage = new Message({
            user: req.user.id,
            name: req.user.name,
            email: req.user.email,
            subject: req.body.subject,
            message: req.body.message
        });

        const message = await newMessage.save();

        // Send email notification to Admin
        try {
            const emailService = require('../utils/email');
            await emailService.sendAdminNewMessageNotification(message);
        } catch (emailErr) {
            console.error('Failed to send admin notification:', emailErr);
            // Don't fail the request if email fails
        }

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/messages/my
// @desc    Get current user's messages
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const messages = await Message.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/messages
// @desc    Get all messages
// @access  Private/Admin
router.get('/', [protect, authorize('admin')], async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 }).populate('user', 'name email');
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/messages/:id/reply
// @desc    Reply to a message
// @access  Private/Admin
router.post('/:id/reply', [protect, authorize('admin')], async (req, res) => {
    try {
        const { reply } = req.body;

        if (!reply) {
            return res.status(400).json({ message: 'Reply text is required' });
        }

        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Update message
        message.reply = reply;
        message.repliedAt = Date.now();
        await message.save();

        // Create notification for user
        await User.findByIdAndUpdate(message.user, {
            $push: {
                notifications: {
                    type: 'message_reply',
                    message: `Admin replied to your message: "${message.subject}"`,
                    createdAt: new Date()
                }
            }
        });

        // Send email
        const emailService = require('../utils/email');
        await emailService.sendReplyToMessage(message, reply);

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private/Admin
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        await message.deleteOne();

        res.json({ message: 'Message removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;

