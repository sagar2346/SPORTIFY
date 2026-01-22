import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { venueService } from '../services/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiStar, FiSearch, FiTrash2 } from 'react-icons/fi';

const Venues = () => {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sportType: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    search: '',
  });

  useEffect(() => {
    loadVenues();
  }, [filters]);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.sportType) params.sportType = filters.sportType;
      if (filters.city) params.city = filters.city;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.search) params.search = filters.search;

      const response = await venueService.getVenues(params);
      setVenues(response.data.data);
    } catch (error) {
      console.error('Error loading venues:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteVenue = async (e, venueId) => {
    e.preventDefault(); // Prevent navigation to details page
    if (!window.confirm('Are you sure you want to delete this venue?')) return;

    try {
      await venueService.deleteVenue(venueId);
      toast.success('Venue deleted successfully');
      // Remove from list
      setVenues(venues.filter(v => v._id !== venueId));
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast.error('Failed to delete venue');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Venues</h1>

      {/* Filters */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search venues..."
                className="input pl-10"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sport Type
            </label>
            <select
              name="sportType"
              className="input"
              value={filters.sportType}
              onChange={handleFilterChange}
            >
              <option value="">All Sports</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="tennis">Tennis</option>
              <option value="badminton">Badminton</option>
              <option value="swimming">Swimming</option>
              <option value="volleyball">Volleyball</option>
              <option value="cricket">Cricket</option>
              <option value="gym">Gym</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              placeholder="City"
              className="input"
              value={filters.city}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price
            </label>
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              className="input"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price
            </label>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              className="input"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Rating
            </label>
            <select
              name="minRating"
              className="input"
              value={filters.minRating}
              onChange={handleFilterChange}
            >
              <option value="">Any</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No venues found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue._id}
              className="card hover:shadow-lg transition-shadow relative group"
            >
              {user?.role === 'admin' && (
                <button
                  onClick={(e) => handleDeleteVenue(e, venue._id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
                  title="Delete Venue"
                >
                  <FiTrash2 />
                </button>
              )}
              <Link to={`/venues/${venue._id}`} className="block h-full">
                {venue.images && venue.images.length > 0 && (
                  <img
                    src={`http://localhost:5001${venue.images[0]}`}
                    alt={venue.name}
                    className="w-full h-48 object-cover rounded-t-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold mb-2">{venue.name}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <FiMapPin className="mr-1" />
                  <span>{venue.location.city}, {venue.location.state}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiStar className="text-yellow-400 mr-1" />
                    <span className="font-semibold">{venue.rating.average}</span>
                    <span className="text-gray-500 ml-1">({venue.rating.count})</span>
                  </div>
                  <span className="text-primary-600 font-semibold">
                    Rs. {venue.basePrice}/hr
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Venues;

