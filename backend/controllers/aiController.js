const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');

// SIMULATED AI LOGIC
// In a real app, this would call OpenAI/Gemini API
const generateResponse = (prompt, context = {}) => {
    const p = prompt.toLowerCase();

    // Greetings
    if (p.match(/\b(hi|hello|hey|yo|greetings)\b/))
        return "Hello! Welcome to Sportify. How can I assist you with your sports journey today?";

    // Purpose/About
    if (p.includes('what is sportify') || p.includes('about app'))
        return "Sportify is your ultimate sports venue booking platform. We connect sports enthusiasts with the best venues in town for Futsal, Cricket, Swimming, and more!";

    // Booking
    if (p.includes('book') || p.includes('reserve') || p.includes('reservation'))
        return "To book a venue, simply log in as a Customer, browse our 'Venues' page, select your preferred sport and time, and proceed to checkout.";

    // Sports
    if (p.includes('sport') || p.includes('activity') || p.includes('game'))
        return "We currently support Futsal, Cricket, Basketball, Swimming, and Badminton. Check the 'Sports' section for more details!";

    // Pricing/Payment
    if (p.includes('price') || p.includes('cost') || p.includes('payment') || p.includes('pay'))
        return "Venue prices vary based on peak hours and location. We accept secure payments via eSewa and direct Bank Transfer.";

    // Registration/Login
    if (p.includes('register') || p.includes('sign up') || p.includes('create account'))
        return "You can register as a 'Customer' to book venues or as a 'Venue Owner' to list your facility. Click 'Register' in the top right corner.";

    if (p.includes('login') || p.includes('sign in'))
        return "Click the 'Login' button in the navbar to access your account. If you forgot your password, please contact support.";

    // Location/Contact
    if (p.includes('location') || p.includes('where') || p.includes('contact') || p.includes('phone') || p.includes('email'))
        return "We operate nationwide! For specific venue locations, check the venue details page. You can contact our support team at support@sportify.com.";

    // Fallback
    return "I'm not sure about that, but I can help you with bookings, finding venues, or account info. Try asking 'How do I book?' or 'What sports are available?'.";
};

exports.chat = async (req, res, next) => {
    try {
        const { message } = req.body;
        const p = message.toLowerCase();

        // 1. Check for "Available Venues" intent
        if (p.includes('available venue') || p.includes('list venue') || p.includes('show venue')) {
            const venues = await Venue.find().limit(5).select('name location sportType');
            if (venues.length === 0) {
                return res.json({ success: true, reply: "There are currently no venues listed on Sportify." });
            }
            const venueList = venues.map(v => `• ${v.name} (${v.sportType}) in ${v.location}`).join('\n');
            return res.json({ success: true, reply: `Here are some available venues:\n${venueList}\n\nVisit the 'Venues' page for more!` });
        }

        // 2. Check for "My Bookings" intent
        if (p.includes('my booking') || p.includes('bookings done') || p.includes('history')) {
            if (!req.user) {
                return res.json({ success: true, reply: "Please log in to see your booking history." });
            }
            const bookings = await Booking.find({ user: req.user.id }).sort('-createdAt').limit(3).populate('venue', 'name');
            if (bookings.length === 0) {
                return res.json({ success: true, reply: "You haven't made any bookings yet." });
            }
            const bookingList = bookings.map(b => `• ${b.venue.name} on ${new Date(b.date).toLocaleDateString()} (${b.payment.status})`).join('\n');
            return res.json({ success: true, reply: `Here are your recent bookings:\n${bookingList}` });
        }

        // 3. Fallback to standard generated response
        const response = generateResponse(message);
        res.status(200).json({ success: true, reply: response });
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
            const sport = b.venue.sportType; // Assuming venue has sportType or similar
            sportCounts[sport] = (sportCounts[sport] || 0) + 1;
        });

        // Sort sports
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
