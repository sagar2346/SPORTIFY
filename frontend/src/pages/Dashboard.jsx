import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService, footageService } from '../services/api';
import { FiCalendar, FiClock, FiDollarSign, FiMapPin, FiList, FiMail, FiUser, FiUsers, FiCheckCircle, FiVideo } from 'react-icons/fi';
// Added FiCheckCircle import

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [footages, setFootages] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, analyticsRes, notificationsRes, footageRes] = await Promise.all([
        userService.getBookings(),
        userService.getAnalytics(),
        userService.getNotifications(),
        footageService.getAll()
      ]);
      setBookings(bookingsRes.data.data.slice(0, 5));
      setAnalytics(analyticsRes.data.data);
      setNotifications(notificationsRes.data.data || []);
      setFootages(footageRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await userService.markAllNotificationsRead();
      // Refresh notifications locally
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Player dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time overview and activity status.</p>
        </div>
          <div className="flex">
            <span className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System online</span>
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          <Link to="/venues" className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/5 transition-all flex flex-col items-center justify-center text-center group">
            <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
              <FiMapPin size={28} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Book venues</span>
          </Link>
          <Link to="/bookings" className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/5 transition-all flex flex-col items-center justify-center text-center group">
            <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
              <FiList size={28} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">My bookings</span>
          </Link>
          <Link to="/message-friends" className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/5 transition-all flex flex-col items-center justify-center text-center group">
            <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
              <FiMail size={28} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Messages</span>
          </Link>
          <Link to="/my-teams" className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/5 transition-all flex flex-col items-center justify-center text-center group">
            <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
              <FiUsers size={28} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">My teams</span>
          </Link>
          <Link to="/analytics" className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/5 transition-all flex flex-col items-center justify-center text-center group">
            <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
              <FiCheckCircle size={28} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">My stats</span>
          </Link>
          <Link to="/profile" className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/5 transition-all flex flex-col items-center justify-center text-center group">
            <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
              <FiUser size={28} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Profile</span>
          </Link>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-sm transition-all hover:shadow-2xl hover:border-slate-900/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-3 whitespace-nowrap">Total bookings</p>
                  <p className="text-4xl font-bold text-slate-900 tracking-tighter">{analytics.totalBookings}</p>
                </div>
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner">
                  <FiCalendar size={32} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-sm transition-all hover:shadow-2xl hover:border-slate-900/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-3 whitespace-nowrap">Completed</p>
                  <p className="text-4xl font-bold text-slate-900 tracking-tighter">{analytics.completedBookings}</p>
                </div>
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                  <FiCheckCircle size={32} />
                </div>
              </div>
            </div>
            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20 transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest mb-3 whitespace-nowrap">Total spent</p>
                  <p className="text-4xl font-bold tracking-tighter">Rs. {analytics.totalSpent}</p>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white/60">
                  <FiDollarSign size={32} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 mb-16 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
              <FiMail className="text-slate-300" /> Notifications
            </h2>
            {notifications.some(n => !n.read) && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <FiMail className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Inbox is clear</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif._id}
                  className={`p-6 rounded-[1.5rem] border transition-all duration-300 ${!notif.read ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className={`text-sm tracking-tight leading-relaxed ${!notif.read ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{notif.message}</p>
                      <p className="text-[10px] text-slate-300 mt-4 font-bold uppercase tracking-widest">
                        {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="shrink-0 mt-2 w-2 h-2 bg-slate-900 rounded-full shadow-[0_0_8px_rgba(15,23,42,0.3)]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game Footage AI Analysis */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 mb-16 shadow-sm border-l-8 border-l-slate-900">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
              <FiVideo className="text-slate-300" /> Match analysis
            </h2>
            <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-bold rounded-xl tracking-widest uppercase">System active</span>
          </div>

          {footages.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <FiVideo className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No footage uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {footages.map((item) => (
                <div key={item._id} className="group bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 hover:border-slate-900/10 hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-video bg-slate-900 flex items-center justify-center relative overflow-hidden">
                    <FiVideo className="text-4xl text-white/5 group-hover:text-white/20 group-hover:scale-125 transition-all duration-700" />
                    <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-all" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 truncate tracking-tight">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-8 font-medium">{item.description}</p>
                    <Link
                      to={`/footage/${item._id}`}
                      className="block text-center py-3.5 bg-white border border-slate-100 text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      View footage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Recent Bookings */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent activity</h2>
            <Link to="/bookings" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
              View all
            </Link>
          </div>
          {bookings.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <FiCalendar className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Link
                  key={booking._id}
                  to={`/bookings/${booking._id}`}
                  className="block p-8 border border-slate-50 rounded-3xl hover:border-slate-900/10 hover:shadow-2xl transition-all duration-500 group bg-slate-50/30"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-white text-slate-300 rounded-2xl flex items-center justify-center mr-6 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                        <FiCalendar size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{booking.venue?.name || 'Venue unavailable'}</h3>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                          {new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:text-right gap-10">
                      <p className="text-2xl font-bold text-slate-900 tracking-tighter">Rs. {booking.totalPrice}</p>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-xl border whitespace-nowrap
                          ${booking.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : booking.status === 'pending'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default Dashboard;
