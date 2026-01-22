import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus, FiBarChart2, FiList, FiArrowRight } from 'react-icons/fi';

const OwnerHome = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="bg-slate-900 text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-slate-900 opacity-90" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-8 md:mb-0">
                            <h1 className="text-4xl font-bold mb-4">Partner Portal</h1>
                            <p className="text-slate-300 text-lg">Manage your venues and grow your business with us.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link to="/venues/add" className="btn bg-primary-600 text-white hover:bg-primary-500 border-none shadow-lg shadow-primary-900/50">
                                <FiPlus className="mr-2" /> List New Venue
                            </Link>
                            <Link to="/owner/dashboard" className="btn bg-white/10 backdrop-blur text-white hover:bg-white/20 border border-white/20">
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Management Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Quick Stats Card */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Business Overview</h2>
                            <Link to="/owner/dashboard" className="text-primary-600 hover:text-primary-700 flex items-center font-semibold">
                                View Analytics <FiArrowRight className="ml-2" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <div className="text-3xl font-black text-slate-900 mb-1">--</div>
                                <div className="text-sm text-slate-500 font-medium uppercase">Active Venues</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <div className="text-3xl font-black text-primary-600 mb-1">--</div>
                                <div className="text-sm text-slate-500 font-medium uppercase">Today's Bookings</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <div className="text-3xl font-black text-green-600 mb-1">$0</div>
                                <div className="text-sm text-slate-500 font-medium uppercase">Revenue</div>
                            </div>
                        </div>
                        <p className="text-center text-slate-400 text-sm mt-4">Real-time data available in dashboard</p>
                    </div>

                    {/* Quick Tools */}
                    <div className="col-span-1 space-y-4">
                        <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
                            <h3 className="font-bold text-primary-900 mb-2 flex items-center"><FiList className="mr-2" /> Manage Inventory</h3>
                            <p className="text-primary-700 text-sm mb-4">Update availability and pricing for your venues.</p>
                            <Link to="/owner/dashboard" className="text-primary-600 font-bold hover:underline">Manage Venues &rarr;</Link>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-2">Need Help?</h3>
                            <p className="text-slate-500 text-sm mb-4">Contact our support team for assistance with your listings.</p>
                            <Link to="/contact" className="text-slate-600 font-bold hover:underline text-sm">Contact Support</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerHome;
