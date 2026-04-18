const Team = require('../models/Team');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
exports.createTeam = async (req, res, next) => {
    try {
        const { name, description, sport } = req.body;

        const team = await Team.create({
            name,
            description,
            sport,
            createdBy: req.user.id,
            members: [req.user.id] // Creator is first member
        });

        res.status(201).json({
            success: true,
            data: team
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Join a team via code
// @route   POST /api/teams/join
// @access  Private
exports.joinTeam = async (req, res, next) => {
    try {
        const { inviteCode } = req.body;

        const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite code'
            });
        }

        if (team.members.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this team'
            });
        }

        team.members.push(req.user.id);
        await team.save();

        res.status(200).json({
            success: true,
            data: team,
            message: 'Joined team successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my teams
// @route   GET /api/teams
// @access  Private
exports.getMyTeams = async (req, res, next) => {
    try {
        const teams = await Team.find({ members: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: teams.length,
            data: teams
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get team details
// @route   GET /api/teams/:id
// @access  Private
exports.getTeam = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('members', 'name email')
            .populate('createdBy', 'name');

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Check membership
        if (!team.members.some(member => member._id.toString() === req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not a member of this team' });
        }

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get team messages
// @route   GET /api/teams/:id/messages
// @access  Private
exports.getTeamMessages = async (req, res, next) => {
    try {
        const messages = await GroupMessage.find({ team: req.params.id })
            .sort({ createdAt: 1 }); // Oldest first for chat history

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload voice message
// @route   POST /api/teams/:id/voice
// @access  Private
exports.uploadVoiceMessage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No audio file uploaded' });
        }

        const { duration } = req.body; // Optional duration metadata

        // Construct full URL (assuming /uploads is served statically)
        const audioUrl = `/uploads/${req.file.filename}`;

        const message = await GroupMessage.create({
            team: req.params.id,
            sender: req.user.id,
            senderName: req.user.name,
            type: 'audio',
            audioUrl: audioUrl,
            content: '' // No text content
        });

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};
