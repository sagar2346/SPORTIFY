import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { venueService, bookingService, reviewService, aiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiMapPin, FiStar, FiClock, FiUsers, FiCheckCircle, FiCpu } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatTime } from '../utils/time';
import { toast } from 'react-hot-toast';

const VenueDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookingData, setBookingData] = useState({
    numberOfPlayers: 1,
    discountCode: '',
  });
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

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
      const fetchedReviews = response.data.data;
      setReviews(fetchedReviews);
      if (fetchedReviews.length > 0) {
        loadAiSummary();
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadAiSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await aiService.getVenueSummary(id);
      setAiSummary(response.data.summary);
    } catch (error) {
      console.error('Error loading AI summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await venueService.getAvailability(id, dateStr);
      setAvailableSlots(response.data.data.slots || []);
      setSelectedSlots([]); // Reset selection on date change
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const handleSlotClick = (slot) => {
    if (selectedSlots.length === 0) {
      setSelectedSlots([slot]);
    } else {
      // Logic for selecting a range
      const slots = [...availableSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const firstSelected = selectedSlots[0];

      // If clicking the same slot, reset
      if (selectedSlots.length === 1 && selectedSlots[0].startTime === slot.startTime) {
        setSelectedSlots([]);
        return;
      }

      // Check if the clicked slot is consecutive or part of a range
      const firstIdx = slots.findIndex(s => s.startTime === firstSelected.startTime);
      const currentIdx = slots.findIndex(s => s.startTime === slot.startTime);

      const start = Math.min(firstIdx, currentIdx);
      const end = Math.max(firstIdx, currentIdx);

      // Check if all slots in the range are available
      const range = slots.slice(start, end + 1);
      setSelectedSlots(range);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    try {
      // Sort to get first and last
      const sorted = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const booking = {
        venueId: id,
        bookingDate: selectedDate.toISOString().split('T')[0],
        startTime: sorted[0].startTime,
        endTime: sorted[sorted.length - 1].endTime,
        numberOfPlayers: bookingData.numberOfPlayers,
        discountCode: bookingData.discountCode || undefined,
      };

      const response = await bookingService.createBooking(booking);
      toast.success('Booking initiated! Redirecting to details...');
      navigate(`/bookings/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
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
    return <div className="text-center py-20 bg-slate-50 min-h-screen flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest text-xs">Venue not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Images */}
            {venue.images && venue.images.length > 0 && (
              <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100/50 group">
                <img
                  src={`http://localhost:5001${venue.images[0]}`}
                  alt={venue.name}
                  className="w-full h-[36rem] object-cover group-hover:scale-105 transition-transform duration-[2s]"
                />
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm">
              <h1 className="text-5xl font-bold mb-6 text-slate-900 tracking-tight">{venue.name}</h1>
              <div className="flex flex-wrap items-center gap-10 mb-10">
                <div className="flex items-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                  <FiMapPin className="mr-3 text-slate-900 text-lg" />
                  <span>{venue.location.address}, {venue.location.city}</span>
                </div>
                <div className="flex items-center bg-slate-50 px-5 py-2 rounded-xl border border-slate-100 shadow-sm">
                  <FiStar className="text-yellow-400 mr-2.5 fill-yellow-400" />
                  <span className="font-bold text-slate-900">{venue.rating.average}</span>
                  <span className="text-slate-400 ml-2 text-[10px] font-bold uppercase tracking-widest">({venue.rating.count} reviews)</span>
                </div>
              </div>
              <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium">{venue.description}</p>
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center">
                  <FiCheckCircle className="mr-3" /> Facilities
                </h3>
                <div className="flex flex-wrap gap-4">
                  {venue.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="bg-slate-50 text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-bold border border-slate-200 uppercase tracking-widest shadow-sm hover:border-slate-900/10 transition-colors"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Summary Section */}
            {reviews.length > 0 && (
              <div className="bg-slate-900 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/50 rounded-full -mr-32 -mt-32 blur-3xl transition-all duration-1000 group-hover:bg-slate-700/50"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-800/30 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
                      <FiCpu className="mr-4 text-slate-400 animate-pulse" />
                      AI Insight
                    </h2>
                    <span className="bg-slate-800 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-700/50">
                      Powered by Gemini
                    </span>
                  </div>

                  {loadingSummary ? (
                    <div className="flex items-center space-x-4 py-8">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-4">Analyzing reviews...</span>
                    </div>
                  ) : aiSummary ? (
                    <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:text-white prose-headings:tracking-tight prose-strong:text-white prose-li:text-slate-300">
                      <ReactMarkdown>{aiSummary}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Summary unavailable</p>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm">
              <h2 className="text-3xl font-bold mb-12 text-slate-900 tracking-tight">Player reviews</h2>
              {reviews.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No reviews yet for this venue</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-slate-50 pb-12 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl mr-5 shadow-2xl shadow-slate-900/10">
                            {review.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg tracking-tight">{review.user.name}</h4>
                            <div className="flex items-center mt-2">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-slate-200'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && <p className="text-slate-500 leading-relaxed font-medium pl-20 text-lg">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white sticky top-8 border border-slate-100 shadow-2xl rounded-[2.5rem] p-8">
              <h2 className="text-2xl font-bold mb-8 text-slate-900 tracking-tight text-center">Venue booking</h2>
              
              <div className="space-y-6">
                {/* Date and Time Grouped */}
                <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Select date
                      </label>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        minDate={new Date()}
                        className="w-full bg-white border border-slate-100 px-6 py-3.5 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm"
                        dateFormat="MMMM d, yyyy"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start</label>
                        <select
                          className="w-full bg-white border border-slate-100 px-4 py-3.5 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm appearance-none cursor-pointer"
                          value={selectedSlots.length > 0 ? selectedSlots[0].startTime : ''}
                          onChange={(e) => {
                            const slot = availableSlots.find(s => s.startTime === e.target.value);
                            if (slot) setSelectedSlots([slot]);
                            else setSelectedSlots([]);
                          }}
                        >
                          <option value="">Start</option>
                          {availableSlots.map((slot, index) => (
                            <option key={index} value={slot.startTime}>{formatTime(slot.startTime)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">End</label>
                        <select
                          className="w-full bg-white border border-slate-100 px-4 py-3.5 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm appearance-none cursor-pointer disabled:opacity-50"
                          value={selectedSlots.length > 1 ? selectedSlots[selectedSlots.length - 1].endTime : ''}
                          disabled={selectedSlots.length === 0}
                          onChange={(e) => {
                            const endSlot = availableSlots.find(s => s.endTime === e.target.value);
                            if (endSlot && selectedSlots.length > 0) {
                              const startSlot = selectedSlots[0];
                              const slots = [...availableSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
                              const startIdx = slots.findIndex(s => s.startTime === startSlot.startTime);
                              const endIdx = slots.findIndex(s => s.endTime === endSlot.endTime);
                              if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
                                setSelectedSlots(slots.slice(startIdx, endIdx + 1));
                              }
                            }
                          }}
                        >
                          <option value="">End</option>
                          {availableSlots
                            .filter(s => selectedSlots.length > 0 && s.startTime >= selectedSlots[0].startTime)
                            .map((slot, index) => (
                              <option key={index} value={slot.endTime}>{formatTime(slot.endTime)}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {selectedSlots.length > 0 && (
                    <div className="p-3 bg-slate-900 rounded-xl text-white flex justify-between items-center animate-fade-in px-4">
                      <div className="text-[9px] font-bold uppercase tracking-widest">
                        Selected: <span className="ml-2 text-white/80">{formatTime(selectedSlots[0].startTime)} - {formatTime(selectedSlots[selectedSlots.length - 1].endTime)}</span>
                      </div>
                      <button onClick={() => setSelectedSlots([])} className="text-white/40 hover:text-white transition-colors text-xs">✕</button>
                    </div>
                  )}
                </div>

                {/* Players and Discount Grouped */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Players</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={venue.capacity}
                        value={bookingData.numberOfPlayers}
                        onChange={(e) => setBookingData({ ...bookingData, numberOfPlayers: parseInt(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Discount</label>
                    <input
                      type="text"
                      value={bookingData.discountCode}
                      onChange={(e) => setBookingData({ ...bookingData, discountCode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300"
                      placeholder="Code"
                    />
                  </div>
                </div>

                {/* Price and Action Grouped */}
                <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total cost</span>
                    <span className="text-2xl font-bold text-slate-900 tracking-tighter">Rs. {venue.basePrice * selectedSlots.length}</span>
                  </div>
                  <button
                    onClick={handleBooking}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                    disabled={selectedSlots.length === 0}
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;

