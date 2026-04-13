import { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { FiActivity, FiAward, FiDollarSign, FiUsers, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, listItemVariants, fadeIn } from '../../utils/motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

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
        return <div className="p-12 text-center text-gray-500 font-bold bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">No game played.</div>;
    }

    const chartData = analytics.weeklyStats || [];
    const sportDistribution = analytics.sportDistribution || [];
    const hasData = chartData.some(d => d.bookings > 0) || sportDistribution.length > 0;

    const COLORS = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

    return (
        <motion.div
            initial="initial"
            animate="animate"
            className="space-y-12"
        >
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Performance analytics</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Real-time insights and activity tracking.</p>
                </div>
                <Link to="/" className="text-slate-600 hover:text-slate-900 font-bold text-xs bg-slate-50 px-6 py-3 rounded-xl transition-all border border-slate-200">
                    &larr; Return to home
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Total Bookings */}
                <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="bg-slate-50 p-4 rounded-xl mb-6 text-slate-400">
                        <FiActivity size={24} />
                    </div>
                    <h3 className="text-slate-500 font-bold mb-1 uppercase text-[10px] tracking-widest">Total bookings</h3>
                    <p className="text-4xl font-bold text-slate-900">{analytics.totalBookings}</p>
                    <div className="mt-4 px-4 py-1 bg-slate-50 rounded-full border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{analytics.completedBookings} Completed</p>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="bg-slate-50 p-4 rounded-xl mb-6 text-slate-400">
                        <FiDollarSign size={24} />
                    </div>
                    <h3 className="text-slate-500 font-bold mb-1 uppercase text-[10px] tracking-widest">Total spent</h3>
                    <p className="text-4xl font-bold text-slate-900">Rs. {analytics.totalSpent}</p>
                    <div className="mt-4 px-4 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Player account</p>
                    </div>
                </div>

                {/* Teams Joined */}
                <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="bg-slate-50 p-4 rounded-xl mb-6 text-slate-400">
                        <FiUsers size={24} />
                    </div>
                    <h3 className="text-slate-500 font-bold mb-1 uppercase text-[10px] tracking-widest">Teams joined</h3>
                    <p className="text-4xl font-bold text-slate-900">{analytics.teamsJoined}</p>
                    <div className="mt-4 px-4 py-1 bg-slate-50 rounded-full border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active member</p>
                    </div>
                </div>

                {/* Primary Sport */}
                <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="bg-slate-50 p-4 rounded-xl mb-6 text-slate-400">
                        <FiAward size={24} />
                    </div>
                    <h3 className="text-slate-500 font-bold mb-1 uppercase text-[10px] tracking-widest">Primary sport</h3>
                    <p className="text-2xl font-bold text-slate-900 w-full truncate" title={analytics.favoriteSport}>
                        {analytics.favoriteSport}
                    </p>
                    <div className="mt-4 px-4 py-1 bg-slate-50 rounded-full border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Top category</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Booking activity</h3>
                    <div className="h-80 w-full flex items-center justify-center">
                        {chartData.some(d => d.bookings > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="bookings" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-10">
                                <div className="bg-gray-50 rounded-full p-4 inline-block mb-3">
                                    <FiActivity className="text-3xl text-gray-300" />
                                </div>
                                <p className="text-gray-400 font-medium">No booking activity this week</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pie Chart */}
                <motion.div variants={listItemVariants} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Sport distribution</h3>
                    <div className="h-80 w-full flex items-center justify-center">
                        {sportDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sportDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationBegin={200}
                                        animationDuration={1500}
                                        stroke="none"
                                    >
                                        {sportDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#000', color: '#fff', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-10">
                                <div className="bg-gray-50 rounded-3xl p-6 inline-block mb-3 border border-gray-100">
                                    <FiAward className="text-4xl text-gray-300" />
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase">No sports detected</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Insight / Suggestion */}
            <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full -mr-48 -mt-48 blur-3xl" />

                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center space-x-2 bg-white/5 px-4 py-1.5 rounded-full mb-6 border border-white/10">
                        <FiTrendingUp className="text-emerald-400" size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Live activity updates</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-white">
                        Keep it up, Champ!
                    </h2>
                    <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                        You've been incredibly active lately. Explore new venues or join emerging teams to reach the next level of your fitness journey.
                    </p>
                    <Link to="/venues" className="btn bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest inline-flex items-center group">
                        Find more venues <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default AnalyticsBoard;
