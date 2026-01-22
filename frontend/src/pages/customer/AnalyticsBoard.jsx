import { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { FiActivity, FiAward, FiDollarSign, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AnalyticsBoard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await userService.getAnalytics();
                setAnalytics(response.data.data);
            } catch (error) {
                console.error('Error loading analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!analytics) {
        return <div className="p-8 text-center text-gray-500">Failed to load statistics.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Analytics</h1>
                    <p className="text-gray-500 mt-1">Track your performance and activity.</p>
                </div>
                <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
                    &larr; Back to Home
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Bookings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 p-3 rounded-full mb-4">
                        <FiActivity className="text-2xl text-blue-600" />
                    </div>
                    <h3 className="text-gray-500 font-medium mb-1">Total Bookings</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalBookings}</p>
                    <p className="text-sm text-gray-400 mt-1">{analytics.completedBookings} completed</p>
                </div>

                {/* Total Spent */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="bg-green-100 p-3 rounded-full mb-4">
                        <FiDollarSign className="text-2xl text-green-600" />
                    </div>
                    <h3 className="text-gray-500 font-medium mb-1">Total Spent</h3>
                    <p className="text-3xl font-bold text-gray-900">${analytics.totalSpent}</p>
                    <p className="text-sm text-gray-400 mt-1">on venue bookings</p>
                </div>

                {/* Teams Joined */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="bg-purple-100 p-3 rounded-full mb-4">
                        <FiUsers className="text-2xl text-purple-600" />
                    </div>
                    <h3 className="text-gray-500 font-medium mb-1">Teams Joined</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.teamsJoined}</p>
                    <p className="text-sm text-gray-400 mt-1">teams</p>
                </div>

                {/* Favorite Sport */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="bg-amber-100 p-3 rounded-full mb-4">
                        <FiAward className="text-2xl text-amber-600" />
                    </div>
                    <h3 className="text-gray-500 font-medium mb-1">Favorite Sport</h3>
                    <p className="text-xl font-bold text-gray-900 capitalize truncate w-full" title={analytics.favoriteSport}>
                        {analytics.favoriteSport}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">most played</p>
                </div>
            </div>

            {/* Insight / Suggestion */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-lg">
                <div className="max-w-3xl">
                    <h2 className="text-2xl font-bold mb-4">Keep it up! 🚀</h2>
                    <p className="text-primary-100 text-lg mb-6">
                        You've been active lately. Check out more venues or join new teams to boost your stats even further.
                    </p>
                    <Link to="/venues" className="inline-block bg-white text-primary-700 font-bold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                        Find More Venues
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsBoard;
