import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { venueService, userService } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const OwnerDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [venuesRes, analyticsRes] = await Promise.all([
        venueService.getMyVenues(),
        userService.getAnalytics(),
      ]);
      setVenues(venuesRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        await venueService.deleteVenue(venueId);
        toast.success('Venue deleted successfully');
        loadData(); // Reload list
      } catch (error) {
        console.error('Error deleting venue:', error);
        toast.error('Failed to delete venue');
      }
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <Link to="/venues/add" className="btn btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Add Venue
        </Link>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <p className="text-gray-600">Total Venues</p>
            <p className="text-3xl font-bold">{analytics.totalVenues}</p>
          </div>
          <div className="card">
            <p className="text-gray-600">Total Bookings</p>
            <p className="text-3xl font-bold">{analytics.totalBookings}</p>
          </div>
          <div className="card">
            <p className="text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold">Rs. {analytics.totalRevenue}</p>
          </div>
        </div>
      )}

      {/* Venues List */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">My Venues</h2>
        {venues.length === 0 ? (
          <p className="text-gray-500">No venues yet. Add your first venue!</p>
        ) : (
          <div className="space-y-4">
            {venues.map((venue) => (
              <div
                key={venue._id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {venue.images && venue.images.length > 0 && (
                    <img
                      src={`http://localhost:5001${venue.images[0]}`}
                      alt={venue.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{venue.name}</h3>
                    <p className="text-sm text-gray-600">
                      {venue.location.city}, {venue.location.state}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded text-xs ${venue.isApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {venue.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/venues/${venue._id}/edit`}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                  >
                    <FiEdit />
                  </Link>
                  <button
                    onClick={() => handleDeleteVenue(venue._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;

