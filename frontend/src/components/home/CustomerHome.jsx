import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiSearch, FiCalendar, FiStar, FiArrowRight, FiActivity } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { venueService } from '../../services/api';

const CustomerHome = () => {
    const { user } = useAuth();
    const [featuredVenues, setFeaturedVenues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadVenues = async () => {
            try {
                const response = await venueService.getVenues({ limit: 3, sort: '-rating.average' });
                setFeaturedVenues(response.data.data);
            } catch (error) {
                console.error('Error loading venues', error);
            } finally {
                setLoading(false);
            }
        };
        loadVenues();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Welcome Hero */}
            <section className="bg-primary-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-8 md:mb-0">
                            <h1 className="text-4xl font-bold mb-4 text-white">Welcome Back, {user?.name}! 👋</h1>
                            <p className="text-white opacity-90 text-lg">Ready for your next game? Find the perfect court nearby.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link to="/venues" className="btn bg-white text-primary-600 hover:bg-primary-50">
                                <FiSearch className="mr-2" /> Find Venues
                            </Link>
                            <Link to="/dashboard" className="btn bg-primary-700 text-white hover:bg-primary-800 border-none">
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <Link to="/venues" className="card group hover:bg-primary-50 border-none ring-1 ring-gray-200">
                        <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FiSearch className="text-primary-600 text-xl" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Book a Venue</h3>
                        <p className="text-gray-500">Browse top-rated courts and fields in your area.</p>
                    </Link>

                    <Link to="/bookings" className="card group hover:bg-secondary-50 border-none ring-1 ring-gray-200">
                        <div className="bg-secondary-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FiCalendar className="text-secondary-600 text-xl" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">My Schedule</h3>
                        <p className="text-gray-500">View upcoming matches and manage bookings.</p>
                    </Link>

                    <Link to="/analytics" className="card group hover:bg-blue-50 border-none ring-1 ring-gray-200">
                        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FiActivity className="text-blue-600 text-xl" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">My Stats</h3>
                        <p className="text-gray-500">Check your activity history and preferences.</p>
                    </Link>
                </div>

                {/* Recommended Venues */}
                <div className="mb-8 flex justify-between items-end">
                    <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                    <Link to="/venues" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center">
                        View All <FiArrowRight className="ml-2" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />)
                    ) : featuredVenues.map((venue) => (
                        <Link key={venue._id} to={`/venues/${venue._id}`} className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="aspect-w-16 aspect-h-9 h-48">
                                {venue.images?.[0] ? (
                                    <img src={`http://localhost:5001${venue.images[0]}`} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center"><FiActivity /></div>
                                )}
                            </div>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-sm font-bold flex items-center shadow-sm">
                                <FiStar className="text-yellow-400 mr-1 fill-yellow-400" /> {venue.rating.average}
                            </div>
                            <div className="bg-white p-6 border border-t-0 border-gray-100 rounded-b-2xl">
                                <h3 className="text-lg font-bold mb-1 text-gray-800">{venue.name}</h3>
                                <p className="text-gray-500 text-sm mb-4">{venue.location.city}</p>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-primary-600 text-lg">Rs. {venue.basePrice}<span className="text-sm font-normal text-gray-400">/hr</span></span>
                                    <span className="text-sm font-semibold text-primary-600 group-hover:translate-x-1 transition-transform">Book Now &rarr;</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomerHome;
