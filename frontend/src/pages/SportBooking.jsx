import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { venueService } from '../services/api';
import { FiMapPin, FiStar, FiFilter, FiCalendar } from 'react-icons/fi';
import { IoMdFootball, IoMdBasketball, IoMdTennisball } from 'react-icons/io';
import { MdSportsCricket, MdSportsVolleyball, MdSportsTennis, MdPool } from 'react-icons/md';
import { FiMap } from 'react-icons/fi';
import LoginModal from '../components/auth/LoginModal';
import VenueMap from '../components/venues/VenueMap';

const sportConfig = {
    football: { name: 'Football', icon: <IoMdFootball />, image: 'https://images.unsplash.com/photo-1579952363873-27f3bde9be2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
    basketball: { name: 'Basketball', icon: <IoMdBasketball />, image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
    cricket: { name: 'Cricket', icon: <MdSportsCricket />, image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
    volleyball: { name: 'Volleyball', icon: <MdSportsVolleyball />, image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
    table_tennis: { name: 'Table Tennis', icon: <MdSportsTennis />, image: 'https://images.unsplash.com/photo-1534158914592-062992bbe900?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
    futsal: { name: 'Futsal', icon: <IoMdFootball />, image: 'https://images.unsplash.com/photo-1518091043644-c1d4457059c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
    swimming: { name: 'Swimming', icon: <MdPool />, image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' }
};

const SportBooking = () => {
    const { sportType } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCity, setFilterCity] = useState('');

    const sportInfo = sportConfig[sportType] || { name: sportType, icon: <IoMdFootball />, image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' };

    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        loadVenues();
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, [sportType]);

    const loadVenues = async () => {
        try {
            setLoading(true);
            const response = await venueService.getVenues({ sportType });
            setVenues(response.data.data || []);
        } catch (error) {
            console.error('Error loading venues:', error);
        } finally {
            setLoading(false);
        }
    };

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingVenueId, setPendingVenueId] = useState(null);

    const handleBookNow = (venueId) => {
        if (!user) {
            setPendingVenueId(venueId);
            setShowLoginModal(true);
            return;
        }
        if (user.role !== 'customer') {
            toast.error("Only customers can book venues. Please login as a customer.", { duration: 3000 });
            return;
        }

        navigate(`/venues/${venueId}`);
    };

    const handleLoginSuccess = () => {
        if (pendingVenueId) {
            navigate(`/venues/${pendingVenueId}`);
            setPendingVenueId(null);
        }
    };

    const filteredVenues = venues.filter(venue =>
        !filterCity || venue.location.city.toLowerCase().includes(filterCity.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div
                className="relative h-96 bg-cover bg-center"
                style={{ backgroundImage: `url(${sportInfo.image})` }}
            >
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
                    <div className="p-6 bg-white/10 backdrop-blur-md rounded-full mb-6 animate-fade-in-up">
                        <span className="text-6xl">{sportInfo.icon}</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up delay-100">{sportInfo.name} Booking</h1>
                    <p className="text-xl md:text-2xl text-gray-200 animate-fade-in-up delay-200">Find and book the best {sportInfo.name} courts near you</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-20 relative z-10">
                {/* Filters and View Toggle */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 flex flex-wrap items-center justify-between gap-4 animate-fade-in-up delay-300">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center text-primary-600 font-semibold text-lg">
                            <FiFilter className="mr-2" />
                            Filters:
                        </div>
                        <div className="flex-1 min-w-[200px] max-w-md">
                            <input
                                type="text"
                                placeholder="Filter by city..."
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-gray-500 hidden md:block">
                            Showing {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'}
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 rounded-md font-medium transition-all ${viewMode === 'list'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                List View
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center ${viewMode === 'map'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <FiMap className="mr-2" />
                                Map View
                            </button>
                        </div>
                    </div>
                </div>

                {/* Venues Grid or Map */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
                    </div>
                ) : filteredVenues.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow text-center">
                        <div className="text-6xl mb-4">🏟️</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No venues found</h3>
                        <p className="text-gray-500 mb-6">We couldn't find any {sportInfo.name} venues matching your criteria.</p>
                        <Link to="/sports" className="text-primary-600 hover:text-primary-700 font-medium">Browse other sports &rarr;</Link>
                    </div>
                ) : viewMode === 'map' ? (
                    <div className="animate-fade-in">
                        <VenueMap venues={filteredVenues} userLocation={userLocation} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                        {filteredVenues.map((venue) => (
                            <div key={venue._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={venue.images && venue.images.length > 0
                                            ? `http://localhost:5001/uploads/${venue.images[0]}`
                                            : 'https://images.unsplash.com/photo-1519758965401-32dfe510633b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                        alt={venue.name}
                                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-sm font-bold text-gray-800 flex items-center shadow-sm">
                                        <FiStar className="text-yellow-400 mr-1" />
                                        {venue.rating?.average?.toFixed(1) || 'New'}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{venue.name}</h3>

                                    <div className="flex items-center text-gray-600 mb-4 text-sm">
                                        <FiMapPin className="mr-1 flex-shrink-0" />
                                        <span className="truncate">{venue.location.city}, {venue.location.state}</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Starting from</span>
                                            <div className="text-xl font-bold text-primary-600">${venue.basePrice}/hr</div>
                                        </div>

                                        <button
                                            onClick={() => handleBookNow(venue._id)}
                                            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg transform active:scale-95 transition-all"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={handleLoginSuccess}
            />
        </div>
    );
};

export default SportBooking;
