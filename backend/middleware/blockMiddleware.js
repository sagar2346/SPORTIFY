const Team = require('../models/Team');

/**
 * Middleware to check if a team is blocked.
 * Can find teamId from:
 * 1. req.params.id (standard for /teams/:id/...)
 * 2. req.params.teamId 
 * 3. req.body.teamId
 */
exports.checkTeamBlock = async (req, res, next) => {
    try {
        const teamId = req.params.id || req.params.teamId || req.body.teamId;

        if (!teamId) {
            return next(); // If no team ID, let the controller handle it or skip
        }

        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        if (team.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'This team is blocked due to unpaid fines. Restricted functions are disabled.',
                isBlocked: true,
                fineAmount: team.fineAmount
            });
        }

        next();
    } catch (error) {
        console.error('Block Middleware Error:', error);
        res.status(500).json({ success: false, message: 'Server error check team block' });
    }
};
