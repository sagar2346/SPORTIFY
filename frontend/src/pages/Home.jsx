import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiClock, FiStar, FiActivity, FiUsers, FiCalendar, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import { venueService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import CustomerHome from '../components/home/CustomerHome';
import OwnerHome from '../components/home/OwnerHome';
import AdminHome from '../components/home/AdminHome';

// Hero Images
import heroFootball from '../assets/hero_football.png';
import heroCricket from '../assets/hero_cricket.png';
import heroBadminton from '../assets/hero_badminton.png';
import heroTennis from '../assets/hero_tennis.png';

const Home = () => {
  const { user } = useAuth();
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    loadFeaturedVenues();
  }, []);

  const loadFeaturedVenues = async () => {
    try {
      const response = await venueService.getVenues({ limit: 3, minRating: 4 });
      setFeaturedVenues(response.data.data);
    } catch (error) {
      console.error('Error loading venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Active Venues', value: '50+', icon: <FiMapPin /> },
    { label: 'Happy Players', value: '2000+', icon: <FiUsers /> },
    { label: 'Bookings Made', value: '10k+', icon: <FiCalendar /> },
  ];

  const sports = [
    { name: 'Football', icon: '⚽', color: 'bg-green-100 text-green-600' },
    { name: 'Cricket', icon: '🏏', color: 'bg-blue-100 text-blue-600' },
    { name: 'Badminton', icon: '🏸', color: 'bg-orange-100 text-orange-600' },
    { name: 'Tennis', icon: '🎾', color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Basketball', icon: '🏀', color: 'bg-red-100 text-red-600' },
    { name: 'Swimming', icon: '🏊', color: 'bg-cyan-100 text-cyan-600' },
  ];

  const features = [
    { title: 'Search', desc: 'Find the perfect court nearby.', icon: <FiSearch /> },
    { title: 'Book', desc: 'Secure your slot instantly.', icon: <FiCheckCircle /> },
    { title: 'Play', desc: 'Enjoy your game!', icon: <FiActivity /> },
  ];

  if (user) {
    if (user.role === 'admin') return <AdminHome />;
    if (user.role === 'venue_owner') return <OwnerHome />;
    if (user.role === 'customer') return <CustomerHome />;
  }

  return (
    <div className="overflow-hidden">

      {/* 1. Hero Section */}
      <section className="relative bg-white pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white -z-10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary-100/50 to-transparent rounded-bl-[100px] -z-10 opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-left animate-slide-up">
              <span className="inline-block py-1 px-3 rounded-full bg-primary-100 text-primary-700 text-sm font-bold mb-6 tracking-wide">
                🚀 The Future of Sports Booking
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6">
                Play More,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent">
                  Worry Less.
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
                Discover top-rated venues, join local communities, and book your next game in seconds.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/venues" className="btn btn-primary text-lg px-8 py-4">
                  Find a Venue <FiChevronRight />
                </Link>
                <Link to="/about" className="btn btn-secondary text-lg px-8 py-4">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Abstract Hero Visual */}
            <div className="md:w-1/2 mt-16 md:mt-0 relative">
              <div className="relative z-10 grid grid-cols-2 gap-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-4 translate-y-8">
                  <div className="bg-white p-2 rounded-2xl shadow-xl animate-blob overflow-hidden">
                    <img src={heroFootball} alt="Football" className="h-40 w-full object-cover rounded-xl" />
                  </div>
                  <div className="bg-white p-2 rounded-2xl shadow-xl overflow-hidden">
                    <img src={heroCricket} alt="Cricket" className="h-32 w-full object-cover rounded-xl" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-2 rounded-2xl shadow-xl overflow-hidden">
                    <img src={heroTennis} alt="Tennis" className="h-32 w-full object-cover rounded-xl" />
                  </div>
                  <div className="bg-white p-2 rounded-2xl shadow-xl animate-blob overflow-hidden" style={{ animationDelay: '1s' }}>
                    <img src={heroBadminton} alt="Badminton" className="h-40 w-full object-cover rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Smart Features Strip */}
      <section className="bg-white py-10 border-y border-slate-100 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex items-center gap-4 group cursor-default">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                <FiClock />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Instant Booking</h4>
                <p className="text-sm text-slate-500">Secure your slot in under 60 seconds.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-default">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center text-xl group-hover:bg-accent group-hover:text-white transition-all duration-300">
                <FiCheckCircle />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Verified Venues</h4>
                <p className="text-sm text-slate-500">Only the best, hand-picked facilities.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-default">
              <div className="w-12 h-12 bg-secondary-100 text-slate-700 rounded-full flex items-center justify-center text-xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                <FiUsers />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Community First</h4>
                <p className="text-sm text-slate-500">Join 2,000+ local sports enthusiasts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Sports */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Popular Sports</h2>
            <p className="text-xl text-slate-500">Choose your game and find the best courts.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {sports.map((sport, idx) => (
              <Link to="/venues" key={idx} className="card hover:-translate-y-2 hover:shadow-xl transition-all duration-300 text-center group cursor-pointer border-none shadow-md">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-4 ${sport.color} group-hover:scale-110 transition-transform`}>
                  {sport.icon}
                </div>
                <h3 className="font-bold text-slate-800">{sport.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-500">Three simple steps to your next game.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-primary-100 -z-10 -translate-y-1/2 transform scale-x-75" />

            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl text-center relative">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-primary-500/30">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-secondary-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Venues (Existing Data) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4">Top Rated Venues</h2>
              <p className="text-xl text-slate-500">The best places to play in your city.</p>
            </div>
            <Link to="/venues" className="hidden md:flex items-center text-primary-600 font-bold hover:text-primary-700 transition-colors">
              View All Venues <FiChevronRight className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredVenues.length > 0 ? featuredVenues.map((venue) => (
                <Link
                  key={venue._id}
                  to={`/venues/${venue._id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="relative h-64 overflow-hidden">
                    {venue.images && venue.images.length > 0 ? (
                      <img
                        src={`http://localhost:5001${venue.images[0]}`}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                        <FiMapPin className="text-4xl" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-primary-700 flex items-center shadow-lg">
                      <FiStar className="mr-1 fill-yellow-400 text-yellow-400" /> {venue.rating.average}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2 text-slate-800">{venue.name}</h3>
                    <div className="flex items-center text-slate-500 mb-4">
                      <FiMapPin className="mr-2 text-primary-500" />
                      <span>{venue.location.city}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="text-slate-400 text-sm">per hour</div>
                      <span className="text-2xl font-black text-primary-600">
                        ${venue.basePrice}
                      </span>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500">No venues found nearby.</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link to="/venues" className="btn btn-outline w-full">View All Venues</Link>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-primary-50 p-8 rounded-3xl relative">
              <div className="text-6xl text-primary-200 absolute top-8 left-8 font-serif">"</div>
              <p className="text-xl text-slate-700 italic relative z-10 mb-6 font-medium leading-relaxed">
                The booking experience is seamless. I found a great badminton court near my office in minutes!
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-200 rounded-full mr-4 flex items-center justify-center font-bold text-primary-800">ST</div>
                <div>
                  <div className="font-bold text-slate-900">Sabina Thapa</div>
                  <div className="text-slate-500 text-sm">Badminton Player</div>
                </div>
              </div>
            </div>
            <div className="bg-secondary-50 p-8 rounded-3xl relative">
              <div className="text-6xl text-secondary-200 absolute top-8 left-8 font-serif">"</div>
              <p className="text-xl text-slate-700 italic relative z-10 mb-6 font-medium leading-relaxed">
                As a venue owner, this platform has doubled my bookings. The dashboard is super easy to use.
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary-200 rounded-full mr-4 flex items-center justify-center font-bold text-secondary-800">SD</div>
                <div>
                  <div className="font-bold text-slate-900">Sagar Dahal</div>
                  <div className="text-slate-500 text-sm">Venue Owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer CTA */}
      <section className="py-24 bg-slate-900 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-primary-600 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900 via-slate-900 to-slate-900" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-5xl font-black text-white mb-8 tracking-tight">Ready to Play?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of sports enthusiasts. Create your account today and get moving.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=customer" className="btn btn-primary text-lg px-10 py-5 shadow-primary-500/50">
              Join as Player
            </Link>
            <Link to="/register?role=venue_owner" className="btn bg-white/10 backdrop-blur text-white border border-white/20 hover:bg-white/20 text-lg px-10 py-5">
              Become a Partner
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
