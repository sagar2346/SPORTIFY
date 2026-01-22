import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiGrid, FiUsers, FiAlertCircle } from 'react-icons/fi';

const AdminHome = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="bg-white border-b border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Administrator Console</h1>
                    <p className="text-slate-500">System Status: <span className="text-green-600 font-bold">● Operational</span></p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link to="/admin/dashboard" className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                        <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-200 transition-colors">
                            <FiGrid className="text-2xl text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Main Dashboard</h2>
                        <p className="text-slate-500 mb-6">Overview of platform statistics, revenue, and active sessions.</p>
                        <span className="text-indigo-600 font-bold group-hover:translate-x-1 inline-block transition-transform">Access Dashboard &rarr;</span>
                    </Link>

                    <Link to="/admin/users" className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                        <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                            <FiUsers className="text-2xl text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">User Management</h2>
                        <p className="text-slate-500 mb-6">Manage customer and owner accounts. View total registered users.</p>
                        <span className="text-blue-600 font-bold group-hover:translate-x-1 inline-block transition-transform">Manage Users &rarr;</span>
                    </Link>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-[100px] -mr-4 -mt-4 opacity-50" />
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center"><FiAlertCircle className="mr-2 text-orange-500" /> Pending Actions</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-slate-600">Venue Approvals</span>
                                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Check Dashboard</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-slate-600">Payment Verifications</span>
                                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Check Dashboard</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
