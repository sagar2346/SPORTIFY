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
            members: [{ user: req.user.id, role: 'leader' }] // Creator is team leader
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

        if (team.members.some(member => member.user.toString() === req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this team'
            });
        }

        team.members.push({ user: req.user.id, role: 'member' });
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
        const teams = await Team.find({ 'members.user': req.user.id })
            .populate('members.user', 'name email role avatar isOnline')
            .populate('createdBy', 'name email')
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
            .populate('members.user', 'name email role avatar isOnline')
            .populate('createdBy', 'name');

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Check membership
        const isMember = team.members.some(member => {
            const memberId = member.user && (member.user._id || member.user);
            return memberId && memberId.toString() === req.user.id;
        });

        if (!isMember) {
            console.log(`Access denied for user ${req.user.id} to team ${team._id}`);
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

// @desc    Add admin to team
// @route   POST /api/teams/:id/add-admin
// @access  Private (Team Creator)
exports.addAdminToTeam = async (req, res, next) => {
    try {
        const { email } = req.body;
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Check if requester is the creator
        if (team.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only team creators can add admins' });
        }

        const adminUser = await User.findOne({ email, role: 'admin' });
        if (!adminUser) {
            return res.status(404).json({ success: false, message: 'Admin user not found with this email' });
        }

        if (team.members.some(m => m.user.toString() === adminUser._id.toString())) {
            return res.status(400).json({ success: false, message: 'This admin is already a team member' });
        }

        team.members.push({ user: adminUser._id, role: 'admin' });
        await team.save();

        res.status(200).json({
            success: true,
            message: 'Admin added to team successfully',
            data: team
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Leave a team
// @route   POST /api/teams/:id/leave
// @access  Private
exports.leaveTeam = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Check if requester is the creator (Creators cannot leave, they must delete)
        if (team.createdBy.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'Team creators cannot leave. You must delete the team or transfer ownership.' });
        }

        // Check if user is a member
        if (!team.members.some(m => m.user.toString() === req.user.id)) {
            return res.status(400).json({ success: false, message: 'You are not a member of this team' });
        }

        // Remove from members list
        team.members = team.members.filter(m => m.user.toString() !== req.user.id);
        await team.save();

        res.status(200).json({
            success: true,
            message: 'Successfully left the team'
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Kick a member from team
// @route   POST /api/teams/:id/kick/:userId
// @access  Private (Team Creator)
exports.kickMember = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Check if requester is the creator
        if (team.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only team creators can kick members' });
        }

        // Prevent creator from kicking themselves
        if (req.params.userId === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot kick yourself' });
        }

        // Check if user is a member
        if (!team.members.some(m => m.user.toString() === req.params.userId)) {
            return res.status(400).json({ success: false, message: 'User is not a member of this team' });
        }

        // Remove from members list
        team.members = team.members.filter(m => m.user.toString() !== req.params.userId);
        await team.save();

        res.status(200).json({
            success: true,
            message: 'Member removed from team successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Pay team fine to unblock (Admin Verification)
// @route   POST /api/teams/:id/pay-fine
// @access  Private (Admin)
exports.payTeamFine = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Unblock team
        team.isBlocked = false;
        team.fineAmount = 0;
        team.finePaymentStatus = 'paid';
        await team.save();

        res.status(200).json({
            success: true,
            message: 'Fine verified. Team unblocked!',
            data: team
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a team message
// @route   DELETE /api/teams/messages/:messageId
// @access  Private
exports.deleteTeamMessage = async (req, res, next) => {
    try {
        const message = await GroupMessage.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Check if requester is the sender
        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only delete your own messages' });
        }

        const teamId = message.team.toString();
        await message.deleteOne();

        // Notify other members via socket
        const io = req.app.get('io');
        if (io) {
            io.to(teamId).emit('message_deleted', { messageId: req.params.messageId, teamId });
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a team
// @route   DELETE /api/teams/:id
// @access  Private (Team Creator)
exports.deleteTeam = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Check if requester is the creator or an admin
        const isCreator = team.createdBy.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Only team creators or admins can delete the team' });
        }

        // Delete all messages associated with the team
        await GroupMessage.deleteMany({ team: req.params.id });

        // Delete the team
        await team.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Team and all associated data deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
