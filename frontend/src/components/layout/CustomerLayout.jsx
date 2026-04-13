import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiCalendar, FiUsers, FiMail, FiBarChart2, FiUser, FiMenu, FiX, FiHome, FiSearch, FiBell, FiChevronRight, FiMapPin } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const CustomerLayout = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

    const playerLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: FiGrid, hub: 'Player Hub' },
        { path: '/bookings', label: 'My Bookings', icon: FiCalendar, hub: 'Player Hub' },
        { path: '/my-teams', label: 'Team Chat', icon: FiUsers, hub: 'Player Hub' },
        { path: '/my-messages', label: 'Messages', icon: FiMail, hub: 'Player Hub' },
        { path: '/analytics', label: 'My Stats', icon: FiBarChart2, hub: 'Player Hub' },
        { path: '/profile', label: 'Profile', icon: FiUser, hub: 'Player Hub' },
    ];

    const partnerLinks = [
        { path: '/owner/dashboard', label: 'Dashboard', icon: FiGrid, hub: 'Partner Hub' },
        { path: '/owner/my-venues', label: 'My Venues', icon: FiMapPin, hub: 'Partner Hub' },
        { path: '/owner/inventory', label: 'Inventory', icon: FiGrid, hub: 'Partner Hub' },
        { path: '/owner/add-venue', label: 'Create Venue', icon: FiMapPin, hub: 'Partner Hub' },
        { path: '/owner/analytics', label: 'Analytics', icon: FiBarChart2, hub: 'Partner Hub' },
        { path: '/profile', label: 'Profile', icon: FiUser, hub: 'Partner Hub' },
        { path: '/kyc', label: 'Verification', icon: FiUser, hub: 'Partner Hub' },
    ];

    const navLinks = user?.role === 'venue_owner' ? partnerLinks : playerLinks;
    const currentHub = user?.role === 'venue_owner' ? 'Partner Hub' : 'Player Hub';

    const getPageTitle = () => {
        const currentLink = navLinks.find(link => isActive(link.path));
        return currentLink ? currentLink.label : (location.pathname === '/kyc' ? 'Verification' : currentHub);
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
            {/* Mobile Sidebar Toggle - Floating on right */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-primary-600 text-white rounded-2xl shadow-xl shadow-primary-600/30 flex items-center justify-center hover:bg-primary-700 transition-all active:scale-95"
            >
                {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Mobile Sidebar Backdrop */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed lg:relative inset-y-0 left-0 z-[90] w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-500 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-20 flex items-center px-8 border-b border-gray-50/50">
                    <Link to="/" className="text-xl font-black text-primary-600 tracking-tighter flex items-center gap-2">
                        SPORTIFY
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2 custom-scrollbar">
                    <div className="px-5 mb-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Navigation</p>
                    </div>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`
                                flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300
                                ${isActive(link.path)
                                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20 border border-transparent'
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                                }
                            `}
                        >
                            <link.icon size={18} className={isActive(link.path) ? 'text-white' : 'text-gray-400'} />
                            <span className="uppercase tracking-widest">{link.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-50/50">
                    <Link 
                        to="/"
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all uppercase tracking-widest"
                    >
                        <FiHome size={18} />
                        Back to Site
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-100 overflow-hidden">
                {/* Internal Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <span className="text-gray-900">{currentHub}</span>
                        <FiChevronRight size={14} />
                        <span className="text-primary-600">{getPageTitle()}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-gray-400 focus-within:ring-2 focus-within:ring-primary-600/10 focus-within:border-primary-600/20 transition-all">
                            <FiSearch size={16} className="mr-3" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-transparent border-none outline-none text-gray-900 font-medium placeholder:text-gray-300 text-xs w-48"
                            />
                        </div>
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2.5 transition-colors rounded-xl ${showNotifications ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-primary-600 hover:bg-gray-50'}`}
                            >
                                <FiBell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl shadow-primary-900/10 border border-gray-100 overflow-hidden z-50"
                                    >
                                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Notifications</h3>
                                            <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">New</span>
                                        </div>
                                        <div className="p-8 text-center">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <FiBell className="text-gray-300" size={20} />
                                            </div>
                                            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">No new alerts</p>
                                            <p className="text-[10px] text-gray-400 font-medium">We'll notify you when something important happens.</p>
                                        </div>
                                        <button className="w-full p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 hover:bg-gray-50 transition-colors border-t border-gray-50">
                                            View all notifications
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="w-px h-6 bg-gray-100 mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-600/10">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-xs font-black text-gray-900 uppercase tracking-wider">{user?.name || 'User'}</p>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{user?.role === 'venue_owner' ? 'Partner' : 'Player'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className={`
                    flex-1 overflow-y-auto custom-scrollbar relative
                    ${isActive('/my-teams') ? 'p-0' : 'p-8 lg:p-12'}
                `}>
                    <div className={`${isActive('/my-teams') ? 'max-w-none h-full' : 'max-w-7xl mx-auto'}`}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CustomerLayout;
