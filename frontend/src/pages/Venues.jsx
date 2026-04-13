// View All Venues Page for SPORTIFY
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { venueService, bookingService } from '../services/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiStar, FiSearch, FiTrash2, FiEdit3 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, listItemVariants, hoverScale, tapScale } from '../utils/motion';
import { formatTime } from '../utils/time';
import PageWrapper from '../components/layout/PageWrapper';
import ReviewModal from '../components/venues/ReviewModal';

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
    date: new Date().toISOString().split('T')[0],
    startTime: '',
  });
  const [unreviewedBookings, setUnreviewedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadVenues();
    if (user && user.role === 'customer') {
      loadUnreviewedBookings();
    }
  }, [filters, user]);

  const loadUnreviewedBookings = async () => {
    try {
      const res = await bookingService.getBookings();
      // Filter for completed/confirmed bookings that haven't been reviewed
      const unreviewed = res.data.data.filter(b => 
        (b.status === 'completed' || b.status === 'confirmed') && !b.isReviewed
      );
      setUnreviewedBookings(unreviewed);
    } catch (err) {
      console.error('Error loading unreviewed bookings:', err);
    }
  };

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
      if (filters.date) params.date = filters.date;
      if (filters.startTime) params.startTime = filters.startTime;

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
    <div className="min-h-screen bg-slate-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
        <div className="mb-14">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Browse venues</h1>
          <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest leading-none">Find and book the perfect spot for your next game</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-2xl mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Booking date
              </label>
              <input
                type="date"
                name="date"
                className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm"
                min={new Date().toISOString().split('T')[0]}
                value={filters.date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Time slot
              </label>
              <select
                name="startTime"
                className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm appearance-none"
                value={filters.startTime}
                onChange={handleFilterChange}
              >
                <option value="">Any time</option>
                {[...Array(16)].map((_, i) => {
                  const hour = i + 6;
                  const time = `${hour < 10 ? '0' + hour : hour}:00`;
                  return <option key={time} value={time}>{formatTime(time)}</option>;
                })}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Sport type
              </label>
              <select
                name="sportType"
                className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm appearance-none"
                value={filters.sportType}
                onChange={handleFilterChange}
              >
                <option value="">All sports</option>
                <option value="football">Football</option>
                <option value="futsal">Futsal</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
                <option value="badminton">Badminton</option>
                <option value="swimming">Swimming</option>
                <option value="volleyball">Volleyball</option>
                <option value="cricket">Cricket</option>
                <option value="gym">Gym</option>
                <option value="table_tennis">Table tennis</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                City
              </label>
              <input
                type="text"
                name="city"
                placeholder="e.g. Kathmandu"
                className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300"
                value={filters.city}
                onChange={handleFilterChange}
              />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search by name or location..."
                  className="w-full bg-slate-50 border border-slate-100 pl-14 pr-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Price range
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Min rating
              </label>
              <select
                name="minRating"
                className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm appearance-none"
                value={filters.minRating}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Venues Grid */}
        {loading ? (
          <div className="text-center py-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No venues found. Try adjusting your filters</p>
          </div>
        ) : (
          <motion.div
            layout
            variants={staggerContainer(0.05, 0.1)}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            <AnimatePresence mode="popLayout">
              {venues.map((venue) => (
                <motion.div
                  layout
                  key={venue._id}
                  variants={listItemVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative group"
                >
                  {user?.role === 'admin' && (
                    <button
                      onClick={(e) => handleDeleteVenue(e, venue._id)}
                      className="absolute top-6 right-6 bg-slate-900 text-white p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-rose-500 shadow-2xl active:scale-95 translate-y-2 group-hover:translate-y-0"
                      title="Delete venue"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                  <Link to={`/venues/${venue._id}`} className="block h-full">
                    <div className="h-full flex flex-col">
                      {venue.images && venue.images.length > 0 && (
                        <div className="h-64 overflow-hidden relative">
                          <img
                            src={`http://localhost:5001${venue.images[0]}`}
                            alt={venue.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      <div className="p-10 flex-grow flex flex-col">
                        <div className="mb-8">
                          <h3 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-slate-600 transition-colors">{venue.name}</h3>
                          <div className="flex items-center text-slate-400 mt-3 text-[10px] font-bold uppercase tracking-widest">
                            <FiMapPin className="mr-2 text-slate-900" />
                            <span>{venue.location.city}, {venue.location.state}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50">
                          <div className="flex items-center px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                            <FiStar className="text-yellow-400 mr-2 fill-yellow-400" size={12} />
                            <span className="font-bold text-slate-900 text-xs">{venue.rating.average}</span>
                            <span className="text-slate-400 ml-1.5 text-[9px] font-bold uppercase tracking-widest">({venue.rating.count})</span>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Starts from</p>
                            <span className="text-xl font-bold text-slate-900 tracking-tighter">
                              Rs. {venue.basePrice}
                            </span>
                          </div>
                        </div>

                        {/* Rate Venue Integration on Card */}
                        {user?.role === 'customer' && unreviewedBookings.some(b => b.venue?._id === venue._id) && (
                          <div className="mt-8 pt-6 border-t border-slate-50">
                             <button
                               onClick={(e) => {
                                 e.preventDefault();
                                 const booking = unreviewedBookings.find(b => b.venue?._id === venue._id);
                                 setSelectedBooking(booking);
                                 setShowReviewModal(true);
                               }}
                               className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[9px] shadow-xl shadow-slate-900/10 hover:bg-yellow-400 hover:text-slate-900 transition-all flex items-center justify-center gap-2 group/btn"
                             >
                               <FiStar className="text-yellow-400 group-hover/btn:fill-slate-900" size={14} />
                               Rate Now
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {selectedBooking && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          bookingId={selectedBooking._id}
          venueId={selectedBooking.venue?._id}
          onSuccess={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
            loadUnreviewedBookings();
            toast.success('Thank you for your review!');
          }}
        />
      )}
    </div>
  );
};

export default Venues;
