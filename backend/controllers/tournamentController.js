const Tournament = require('../models/Tournament');
const TournamentRegistration = require('../models/TournamentRegistration');
const Team = require('../models/Team');

// @desc    Create tournament
// @route   POST /api/tournaments
// @access  Private (Admin)
exports.createTournament = async (req, res, next) => {
    try {
        req.body.createdBy = req.user.id;

        // Handle image upload
        if (req.file) {
            req.body.image = `/uploads/tournaments/${req.file.filename}`;
        }

        // Handle stringified location from FormData
        if (typeof req.body.location === 'string') {
            try {
                req.body.location = JSON.parse(req.body.location);
            } catch (e) {
                console.error('Error parsing location JSON:', e);
            }
        }

        // Explicitly parse numeric fields from FormData strings
        if (req.body.entryFee !== undefined) req.body.entryFee = Number(req.body.entryFee);
        if (req.body.maxTeams !== undefined) req.body.maxTeams = Number(req.body.maxTeams);

        const tournament = await Tournament.create(req.body);

        res.status(201).json({
            success: true,
            data: tournament,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
exports.getTournaments = async (req, res, next) => {
    try {
        const tournaments = await Tournament.find().populate('venue', 'name location images');

        res.status(200).json({
            success: true,
            count: tournaments.length,
            data: tournaments,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single tournament
// @route   GET /api/tournaments/:id
// @access  Public
exports.getTournament = async (req, res, next) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('venue', 'name location images')
            .populate('createdBy', 'name email');

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found',
            });
        }

        // Get registered teams/participants
        const registrations = await TournamentRegistration.find({
            tournament: req.params.id,
            status: 'confirmed',
        })
        .populate('team', 'name sport')
        .populate('registeredBy', 'name email');

        // Filter out invalid registrations
        // (team registrations must have a team, solo registrations just need registeredBy)
        const validRegistrations = registrations.filter(reg => {
            if (tournament.registrationType === 'solo') {
                return reg.registeredBy !== null;
            } else {
                return reg.team !== null;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                ...tournament.toObject(),
                registrations: validRegistrations,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register team for tournament
// @route   POST /api/tournaments/:id/register
// @access  Private
exports.registerTeam = async (req, res, next) => {
    try {
        const { teamId } = req.body;
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found',
            });
        }

        // Check registration deadline
        if (new Date() > new Date(tournament.registrationDeadline)) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline has passed',
            });
        }

        const isSolo = tournament.registrationType === 'solo';

        let team = null;
        if (!isSolo) {
            // Check team exists and belongs to user
            if (!teamId) {
                return res.status(400).json({
                    success: false,
                    message: 'Team selection is required for this tournament',
                });
            }

            team = await Team.findById(teamId);
            if (!team) {
                return res.status(404).json({
                    success: false,
                    message: 'Team not found',
                });
            }

            if (team.createdBy.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Only the team creator can register for a tournament',
                });
            }

            // Check if team is blocked
            if (team.isBlocked) {
                return res.status(403).json({
                    success: false,
                    message: 'Your team is blocked from participating in tournaments. Please check your fine status.',
                });
            }

            // Check sport compatibility
            if (team.sport.toLowerCase() !== tournament.sportType.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    message: `This tournament is for ${tournament.sportType}, but your team is for ${team.sport}`,
                });
            }
        }

        // Check if tournament is full
        const currentRegs = await TournamentRegistration.countDocuments({
            tournament: req.params.id,
            status: 'confirmed',
        });

        if (currentRegs >= tournament.maxTeams) {
            return res.status(400).json({
                success: false,
                message: isSolo ? 'Tournament has reached maximum capacity' : 'Tournament has reached maximum team capacity',
            });
        }

        // Create registration
        const registration = await TournamentRegistration.create({
            tournament: req.params.id,
            team: isSolo ? undefined : teamId,
            registeredBy: req.user.id,
            paymentStatus: tournament.entryFee > 0 ? 'pending' : 'paid',
        });

        res.status(201).json({
            success: true,
            data: registration,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: isSolo ? 'You are already registered for this tournament' : 'This team is already registered for this tournament',
            });
        }
        next(error);
    }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private (Admin)
exports.updateTournament = async (req, res, next) => {
    try {
        // Handle image upload
        if (req.file) {
            req.body.image = `/uploads/tournaments/${req.file.filename}`;
        }

        // Handle stringified location from FormData
        if (typeof req.body.location === 'string') {
            try {
                req.body.location = JSON.parse(req.body.location);
            } catch (e) {
                console.error('Error parsing location JSON:', e);
            }
        }

        // Explicitly parse numeric fields from FormData strings
        if (req.body.entryFee !== undefined) req.body.entryFee = Number(req.body.entryFee);
        if (req.body.maxTeams !== undefined) req.body.maxTeams = Number(req.body.maxTeams);

        const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found',
            });
        }

        res.status(200).json({
            success: true,
            data: tournament,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private (Admin)
exports.deleteTournament = async (req, res, next) => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found',
            });
        }

        await tournament.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};
