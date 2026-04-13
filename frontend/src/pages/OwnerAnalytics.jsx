import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { FiActivity, FiDollarSign, FiMapPin, FiStar, FiTrendingUp, FiArrowLeft, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, listItemVariants, fadeIn } from '../utils/motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const OwnerAnalytics = () => {
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
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 shadow-sm">
                    <p className="text-gray-500 font-bold mb-4">No analytics data available yet.</p>
                    <Link to="/owner/dashboard" className="btn btn-primary">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    const COLORS = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];
    const RATING_COLORS = {
        5: '#10b981',
        4: '#84cc16',
        3: '#eab308',
        2: '#f97316',
        1: '#ef4444'
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300"
        >
            {/* Header */}
            <motion.div
                variants={fadeIn('down', 'spring', 0.1, 0.8)}
                className="flex justify-between items-center mb-8"
            >
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Owner Insights</h1>
                    <p className="text-gray-500 mt-1">Granular analysis of your business performance.</p>
                </div>
                <Link to="/owner/dashboard" className="flex items-center text-primary-600 hover:text-primary-700 font-bold text-sm bg-primary-50 px-6 py-3 rounded-2xl transition-all active:scale-95 border border-primary-100">
                    <FiArrowLeft className="mr-2" /> Back to Dashboard
                </Link>
            </motion.div>

            {/* Summary Cards */}
            <motion.div
                variants={staggerContainer(0.1, 0.2)}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
                <motion.div variants={listItemVariants} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center group transition-all duration-300 hover:shadow-2xl">
                    <div className="bg-emerald-600 p-4 rounded-2xl mb-5 shadow-lg shadow-emerald-900/20 group-hover:scale-110 transition-transform">
                        <FiDollarSign className="text-3xl text-white" />
                    </div>
                    <h3 className="text-gray-500 font-bold mb-1 uppercase text-xs">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900">Rs. {analytics.totalRevenue.toLocaleString()}</p>
                </motion.div>

                <motion.div variants={listItemVariants} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center group transition-all duration-300 hover:shadow-2xl">
                    <div className="bg-primary-600 p-4 rounded-2xl mb-5 shadow-lg shadow-primary-900/20 group-hover:scale-110 transition-transform">
                        <FiActivity className="text-3xl text-white" />
                    </div>
                    <h3 className="text-gray-500 font-bold mb-1 uppercase text-xs">Total Bookings</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalBookings}</p>
                </motion.div>

                <motion.div variants={listItemVariants} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center group transition-all duration-300 hover:shadow-2xl">
                    <div className="bg-indigo-600 p-4 rounded-2xl mb-5 shadow-lg shadow-indigo-900/20 group-hover:scale-110 transition-transform">
                        <FiMapPin className="text-3xl text-white" />
                    </div>
                    <h3 className="text-gray-500 font-bold mb-1 uppercase text-xs">Active Venues</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalVenues}</p>
                </motion.div>

                <motion.div variants={listItemVariants} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center group transition-all duration-300 hover:shadow-2xl">
                    <div className="bg-amber-500 p-4 rounded-2xl mb-5 shadow-lg shadow-amber-900/20 group-hover:scale-110 transition-transform">
                        <FiStar className="text-3xl text-white" />
                    </div>
                    <h3 className="text-gray-500 font-bold mb-1 uppercase text-xs">Total Reviews</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {analytics.reviewDistribution?.reduce((acc, curr) => acc + curr.count, 0) || 0}
                    </p>
                </motion.div>
            </motion.div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue Bar Chart */}
                <motion.div
                    variants={fadeIn('right', 'spring', 0.4, 1)}
                    className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center">
                            <FiTrendingUp className="mr-2 text-primary-600" /> Monthly Revenue
                        </h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} tickFormatter={(value) => `Rs.${value}`} />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`Rs. ${value}`, 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill="#0ea5e9" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Sport Distribution Pie Chart */}
                <motion.div
                    variants={fadeIn('left', 'spring', 0.4, 1)}
                    className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center">
                            <FiPieChart className="mr-2 text-primary-600" /> Sport Distribution
                        </h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.sportDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {analytics.sportDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#18181b', color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Venue Performance Bar Chart */}
                <motion.div
                    variants={fadeIn('right', 'spring', 0.6, 1)}
                    className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center">
                            <FiBarChart2 className="mr-2 text-primary-600" /> Venue Performance
                        </h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.venuePerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11, fontWeight: 700 }} width={120} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="bookings" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Review Distribution */}
                <motion.div
                    variants={fadeIn('left', 'spring', 0.6, 1)}
                    className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
                >
                    <h3 className="text-sm font-bold text-gray-900 uppercase mb-8 flex items-center">
                        <FiStar className="mr-2 text-yellow-500" /> Review Ratings
                    </h3>
                    <div className="space-y-6">
                        {[5, 4, 3, 2, 1].map(rating => {
                            const stat = analytics.reviewDistribution.find(s => s.rating === rating);
                            const count = stat ? stat.count : 0;
                            const totalReviews = analytics.reviewDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
                            const percentage = (count / totalReviews) * 100;

                            return (
                                <div key={rating} className="flex items-center space-x-4">
                                    <span className="text-sm font-bold text-gray-600 w-4">{rating}</span>
                                    <FiStar className="text-yellow-400 w-4 h-4 fill-current" />
                                    <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: RATING_COLORS[rating] }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 w-8">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Overall Satisfaction</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {(() => {
                                const totalWeight = analytics.reviewDistribution.reduce((acc, curr) => acc + (curr.rating * curr.count), 0);
                                const totalCount = analytics.reviewDistribution.reduce((acc, curr) => acc + curr.count, 0);
                                return totalCount > 0 ? (totalWeight / totalCount).toFixed(1) : '0.0';
                            })()}
                            <span className="text-sm text-gray-400 ml-1">/ 5.0</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default OwnerAnalytics;
