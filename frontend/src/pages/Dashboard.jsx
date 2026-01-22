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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/venues" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <FiMapPin className="text-3xl text-primary-600 mb-2" />
          <span className="font-semibold text-gray-900">Book Venues</span>
        </Link>
        <Link to="/bookings" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <FiList className="text-3xl text-primary-600 mb-2" />
          <span className="font-semibold text-gray-900">My Bookings</span>
        </Link>
        <Link to="/my-messages" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <FiMail className="text-3xl text-primary-600 mb-2" />
          <span className="font-semibold text-gray-900">My Messages</span>
        </Link>
        <Link to="/profile" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <FiUser className="text-3xl text-primary-600 mb-2" />
          <span className="font-semibold text-gray-900">Profile</span>
        </Link>
        <Link to="/my-teams" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <FiUsers className="text-3xl text-primary-600 mb-2" />
          <span className="font-semibold text-gray-900">My Teams</span>
        </Link>
        <Link to="/message-friends" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <FiMail className="text-3xl text-primary-600 mb-2" />
          <span className="font-semibold text-gray-900">Message Friends</span>
        </Link>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold">{analytics.totalBookings}</p>
              </div>
              <FiCalendar className="text-4xl text-primary-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Completed</p>
                <p className="text-3xl font-bold">{analytics.completedBookings}</p>
              </div>
              <FiClock className="text-4xl text-primary-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold">${analytics.totalSpent}</p>
              </div>
              <FiDollarSign className="text-4xl text-primary-600" />
            </div>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <FiMail className="mr-2" /> Recent Notifications
          </h2>
          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center bg-primary-50 px-3 py-1 rounded-full transition-colors"
            >
              <FiCheckCircle className="mr-1.5" /> Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
            <FiMail className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No notifications.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {notifications.slice(0, 10).map((notif) => (
              <div
                key={notif._id}
                className={`p-4 rounded-lg border flex justify-between items-start transition-all ${!notif.read ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
              >
                <div className="flex-1">
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!notif.read && (
                  <span className="flex-shrink-0 ml-3">
                    <span className="h-2.5 w-2.5 bg-blue-600 rounded-full block ring-4 ring-blue-100"></span>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Game Footage AI Analysis */}
      <div className="card mb-8 border-l-4 border-primary-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <FiVideo className="mr-2 text-primary-600" /> AI Game Footage Analysis
          </h2>
        </div>

        {footages.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
            <FiVideo className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No game footage uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {footages.map((item) => (
              <div key={item._id} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <FiVideo className="text-4xl text-gray-400" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  <Link
                    to={`/footage/${item._id}`}
                    className="mt-4 w-full btn btn-primary flex items-center justify-center py-2 text-sm"
                  >
                    Watch & Analyze with AI
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Bookings</h2>
          <Link to="/bookings" className="text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Link
                key={booking._id}
                to={`/bookings/${booking._id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{booking.venue?.name || 'Venue Unavailable'}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.bookingDate).toLocaleDateString()} •{' '}
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${booking.totalPrice}</p>
                    <span
                      className={`text-sm px-2 py-1 rounded ${booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
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
