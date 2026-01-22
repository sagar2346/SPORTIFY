import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { venueService, bookingService, reviewService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiMapPin, FiStar, FiClock, FiUsers } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const VenueDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({
    numberOfPlayers: 1,
    discountCode: '',
  });

  useEffect(() => {
    loadVenue();
    loadReviews();
  }, [id]);

  useEffect(() => {
    if (venue) {
      loadAvailability();
    }
  }, [venue, selectedDate]);

  const loadVenue = async () => {
    try {
      const response = await venueService.getVenue(id);
      setVenue(response.data.data);
    } catch (error) {
      console.error('Error loading venue:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewService.getVenueReviews(id);
      setReviews(response.data.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadAvailability = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await venueService.getAvailability(id, dateStr);
      setAvailableSlots(response.data.data.slots || []);
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'customer' && user.kycStatus !== 'verified') {
      toast.error('KYC verification required before booking. Please complete verification in your profile.');
      navigate('/profile');
      return;
    }

    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    try {
      const booking = {
        venueId: id,
        bookingDate: selectedDate.toISOString().split('T')[0],
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        numberOfPlayers: bookingData.numberOfPlayers,
        discountCode: bookingData.discountCode || undefined,
      };

      const response = await bookingService.createBooking(booking);
      navigate(`/bookings/${response.data.data._id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!venue) {
    return <div className="text-center py-12">Venue not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Images */}
          {venue.images && venue.images.length > 0 && (
            <div className="mb-6">
              <img
                src={`http://localhost:5001${venue.images[0]}`}
                alt={venue.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Details */}
          <div className="card mb-6">
            <h1 className="text-3xl font-bold mb-4">{venue.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <FiMapPin className="mr-1 text-gray-500" />
                <span>{venue.location.address}, {venue.location.city}</span>
              </div>
              <div className="flex items-center">
                <FiStar className="text-yellow-400 mr-1" />
                <span className="font-semibold">{venue.rating.average}</span>
                <span className="text-gray-500 ml-1">({venue.rating.count} reviews)</span>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{venue.description}</p>
            <div>
              <h3 className="font-semibold mb-2">Facilities:</h3>
              <div className="flex flex-wrap gap-2">
                {venue.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-semibold">{review.user.name}</span>
                        <div className="flex items-center ml-2">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={
                                i < review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && <p className="text-gray-700">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Book Now</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  minDate={new Date()}
                  className="input w-full"
                  dateFormat="MMMM d, yyyy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm">No slots available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded border ${selectedSlot?.startTime === slot.startTime
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-300'
                          }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Players
                </label>
                <input
                  type="number"
                  min="1"
                  max={venue.capacity}
                  value={bookingData.numberOfPlayers}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      numberOfPlayers: parseInt(e.target.value),
                    })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code (Optional)
                </label>
                <input
                  type="text"
                  value={bookingData.discountCode}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      discountCode: e.target.value,
                    })
                  }
                  className="input"
                  placeholder="Enter code"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Price:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    Rs. {venue.basePrice}/hr
                  </span>
                </div>
                <button
                  onClick={handleBooking}
                  className="btn btn-primary w-full"
                  disabled={!selectedSlot}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;

