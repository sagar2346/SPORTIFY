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
        <div className="min-h-screen bg-gray-50 transition-colors duration-300">
            {/* Hero Section */}
            <div
                className="relative h-[400px] bg-cover bg-center overflow-hidden"
                style={{ backgroundImage: `url(${sportInfo.image})` }}
            >
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
                    <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] mb-8 border border-white/10 shadow-2xl">
                        <span className="text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{sportInfo.icon}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">{sportInfo.name}</h1>
                    <p className="text-lg md:text-xl text-slate-300 font-medium">Discover available venues</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-24 relative z-10">
                {/* Filters and View Toggle */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm mb-12 flex flex-wrap items-center justify-between gap-8 border border-slate-100">
                    <div className="flex items-center gap-8 flex-1">
                        <div className="flex items-center text-slate-400 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">
                            <FiFilter className="mr-3 text-slate-900" size={16} />
                            Filter by city
                        </div>
                        <div className="flex-1 min-w-[200px] max-w-md">
                            <input
                                type="text"
                                placeholder="Enter city name..."
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-slate-900 transition-all font-medium text-slate-900 placeholder-slate-300"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                            Found {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'}
                        </div>
                        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'list'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                List
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center ${viewMode === 'map'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <FiMap className="mr-2" />
                                Map
                            </button>
                        </div>
                    </div>
                </div>

                {/* Venues Grid or Map */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 drop-shadow-[0_0_10px_rgba(234,88,12,0.3)]"></div>
                    </div>
                ) : filteredVenues.length === 0 ? (
                    <div className="bg-white p-20 rounded-[2.5rem] shadow-sm text-center border border-slate-100 flex flex-col items-center">
                        <div className="text-6xl mb-8 bg-slate-50 p-8 rounded-[2rem] text-slate-300">
                            <FiMapPin />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No venues found</h3>
                        <p className="text-slate-500 mb-10 font-medium">There are no {sportInfo.name} venues available in this city right now.</p>
                        <Link to="/sports" className="px-10 py-5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Browse other sports</Link>
                    </div>
                ) : viewMode === 'map' ? (
                    <div className="animate-fade-in">
                        <VenueMap venues={filteredVenues} userLocation={userLocation} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
                        {filteredVenues.map((venue) => (
                            <div key={venue._id} className="bg-white rounded-[2rem] shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-slate-100 hover:-translate-y-2 flex flex-col">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={venue.images && venue.images.length > 0
                                            ? `http://localhost:5001/uploads/${venue.images[0]}`
                                            : 'https://images.unsplash.com/photo-1519758965401-32dfe510633b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                        alt={venue.name}
                                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-900 flex items-center shadow-lg border border-white/20">
                                        <FiStar className="text-amber-400 mr-2 fill-amber-400" />
                                        {venue.rating?.average?.toFixed(1) || 'New'}
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2 truncate tracking-tight">{venue.name}</h3>

                                    <div className="flex items-center text-slate-400 mb-8 text-[10px] font-bold uppercase tracking-widest">
                                        <FiMapPin className="mr-2 flex-shrink-0 text-slate-900" />
                                        <span className="truncate">{venue.location.city}, {venue.location.state}</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</span>
                                            <div className="text-2xl font-bold text-slate-900 tracking-tighter">Rs. {venue.basePrice}<span className="text-xs text-slate-400 font-medium tracking-normal ml-1">/hr</span></div>
                                        </div>

                                        <button
                                            onClick={() => handleBookNow(venue._id)}
                                            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
                                        >
                                            Book now
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
