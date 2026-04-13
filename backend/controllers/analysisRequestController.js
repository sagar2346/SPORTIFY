const AnalysisRequest = require('../models/AnalysisRequest');
const Team = require('../models/Team');

// @desc    Create an analysis request
// @route   POST /api/analysis-requests
// @access  Private (Team Leader)
exports.createRequest = async (req, res, next) => {
    try {
        const { teamId, title, description } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Check if requester is the team leader
        if (team.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only team leaders can request analysis' });
        }

        const request = await AnalysisRequest.create({
            team: teamId,
            requestedBy: req.user.id,
            title,
            description
        });

        res.status(201).json({
            success: true,
            data: request
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get requests for a team
// @route   GET /api/analysis-requests/team/:teamId
// @access  Private
exports.getTeamRequests = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Check membership - Allow Admins to see team requests even if not members
        const isMember = team.members.some(member => {
            const memberId = member.user && (member.user._id || member.user);
            return memberId && memberId.toString() === req.user.id;
        });

        if (!isMember && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const requests = await AnalysisRequest.find({ team: req.params.teamId })
            .populate('requestedBy', 'name')
            .populate('footage', 'title videoUrl createdAt')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update request status
// @route   PUT /api/analysis-requests/:id
// @access  Private (Admin)
exports.updateRequest = async (req, res, next) => {
    try {
        let request = await AnalysisRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Only admins or the leader who created it should be able to update/cancel?
        // Actually, user requested "admin should be able to see and upload"
        // Let's stick to simple implementation for now.

        request = await AnalysisRequest.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        next(error);
    }
};
