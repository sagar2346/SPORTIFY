const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const Review = require('../models/Review');
const { generateGeneralChat, generateVenueReviewSummary } = require('../utils/gemini');

exports.chat = async (req, res, next) => {
    try {
        const { message } = req.body;
        const p = message.toLowerCase();

        // 1. Guest Mode Restriction
        if (!req.user) {
            const allowedKeywords = ['how do i login', 'how can i login', 'how to login', 'logging in', 'login', 'sign in'];
            const isAllowed = allowedKeywords.some(keyword => p.includes(keyword));

            if (!isAllowed) {
                return res.status(200).json({ 
                    success: true, 
                    reply: "Please login to use me. Currently, I can only help you with 'How do I login to the platform' in Guest Mode." 
                });
            }
        }

        // Prepare context for AI
        let venuesContext = "";
        let historyContext = "";

        // 1. Check for "Available Venues" intent or just proactive context
        if (p.includes('venue') || p.includes('sport')) {
            const venues = await Venue.find().limit(5).select('name location sportType');
            venuesContext = venues.map(v => `${v.name} (${v.sportType}) in ${v.location}`).join(', ');
        }

        // 2. Check for "My Bookings" context
        if (req.user && (p.includes('my') || p.includes('booking') || p.includes('history'))) {
            const bookings = await Booking.find({ user: req.user.id }).sort('-createdAt').limit(3).populate('venue', 'name');
            historyContext = bookings.filter(b => b.venue).map(b => `${b.venue.name} on ${new Date(b.date).toLocaleDateString()}`).join(', ');
        }

        // 3. Call real Gemini AI
        const reply = await generateGeneralChat(message, {
            venues: venuesContext,
            history: historyContext,
            userRole: req.user?.role
        });

        res.status(200).json({ success: true, reply });
    } catch (error) {
        next(error);
    }
};

exports.getRecommendations = async (req, res, next) => {
    try {
        // Recommend based on user's booking history
        const bookings = await Booking.find({ user: req.user.id }).populate('venue');

        // Simple logic: Find most booked sport
        const sportCounts = {};
        bookings.forEach(b => {
            if (b.venue) {
                const sport = b.venue.sportType;
                sportCounts[sport] = (sportCounts[sport] || 0) + 1;
            }
        });

        const topSports = Object.entries(sportCounts).sort((a, b) => b[1] - a[1]).map(e => e[0]);

        let recommendation = "";
        if (topSports.length > 0) {
            recommendation = `Based on your history, you love ${topSports[0]}! Check out new ${topSports[0]} venues in your area.`;
        } else {
            recommendation = "You haven't booked anything yet. Why not try Futsal? It's our most popular sport!";
        }

        res.status(200).json({ success: true, recommendation });
    } catch (error) {
        next(error);
    }
};

exports.getInsights = async (req, res, next) => {
    try {
        const role = req.user.role;
        let insight = "";

        if (role === 'admin') {
            const userCount = await User.countDocuments();
            const venueCount = await Venue.countDocuments();
            insight = `System Health: Excellent. We have ${userCount} active users and ${venueCount} venues listed. Everything is running smoothly.`;
        } else if (role === 'venue_owner') {
            const myVenues = await Venue.find({ owner: req.user.id });
            const venueIds = myVenues.map(v => v._id);
            const bookingCount = await Booking.countDocuments({ venue: { $in: venueIds } });
            insight = `Business Update: You have ${myVenues.length} venues active. Total lifetime bookings: ${bookingCount}. Keep up the good work!`;
        } else {
            insight = "No insights available for your role.";
        }

        res.status(200).json({ success: true, insight });
    } catch (error) {
        next(error);
    }
};

exports.getVenueReviewSummary = async (req, res, next) => {
    try {
        const { venueId } = req.params;
        const reviews = await Review.find({ venue: venueId });
        
        if (!reviews || reviews.length === 0) {
            return res.status(200).json({ 
                success: true, 
                summary: "No reviews available yet for this venue to summarize." 
            });
        }

        const reviewsText = reviews.map(r => `Rating: ${r.rating}/5. Comment: ${r.comment}`).join('\n\n');
        
        const summary = await generateVenueReviewSummary(reviewsText);

        res.status(200).json({ success: true, summary });
    } catch (error) {
        next(error);
    }
};
