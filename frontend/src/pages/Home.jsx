import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiClock, FiCheckCircle, FiUsers, FiArrowRight, FiChevronRight, FiPlay, FiStar, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { venueService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import CustomerHome from '../components/home/CustomerHome';
import OwnerHome from '../components/home/OwnerHome';
import AdminHome from '../components/home/AdminHome';

import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, listItemVariants, fadeIn, hoverScale, tapScale } from '../utils/motion';
import PageWrapper from '../components/layout/PageWrapper';

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

  const sports = [
    { name: 'Football', icon: '⚽', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Cricket', icon: '🏏', color: 'bg-blue-50 text-blue-600' },
    { name: 'Badminton', icon: '🏸', color: 'bg-orange-50 text-orange-600' },
    { name: 'Tennis', icon: '🎾', color: 'bg-yellow-50 text-yellow-600' },
    { name: 'Basketball', icon: '🏀', color: 'bg-rose-50 text-rose-600' },
    { name: 'Swimming', icon: '🏊', color: 'bg-cyan-100 text-cyan-600' },
  ];

  if (user) {
    if (user.role === 'admin') return <AdminHome />;
    if (user.role === 'venue_owner') return <OwnerHome />;
    if (user.role === 'customer') return <CustomerHome />;
  }

  return (
    <PageWrapper className="overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative bg-white pt-24 pb-40 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-50 rounded-full -mr-96 -mt-96 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-50/50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="lg:w-1/2 text-left"
            >
              <motion.div variants={fadeIn('down', 'tween', 0.1, 0.6)}>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-900/5 text-slate-900 text-[10px] font-bold tracking-[0.2em] uppercase mb-8 border border-slate-900/5 backdrop-blur-sm">
                  The future of sports booking
                </span>
              </motion.div>

              <motion.h1 variants={fadeIn('up', 'tween', 0.2, 0.8)} className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.95] mb-8 tracking-tighter">
                Play more.<br />
                <span className="text-slate-300">Worry less.</span>
              </motion.h1>

              <motion.p variants={fadeIn('up', 'tween', 0.3, 0.8)} className="text-xl text-slate-500 mb-12 max-w-lg leading-relaxed font-medium">
                Discover top-rated venues, join local communities, and book your next game in seconds.
              </motion.p>

              <motion.div variants={fadeIn('up', 'tween', 0.4, 0.8)} className="flex flex-wrap gap-5">
                <Link to="/venues" className="group px-10 py-5 bg-slate-900 text-white rounded-[1.25rem] text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 active:scale-95 flex items-center gap-3">
                  Find a venue <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-[1.25rem] text-xs font-bold uppercase tracking-widest hover:border-slate-900 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  How it works
                </button>
              </motion.div>
            </motion.div>

            {/* Abstract Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 grid grid-cols-2 gap-6">
                <div className="space-y-6 translate-y-12">
                  <motion.div whileHover={{ y: -10 }} className="bg-white p-3 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-50">
                    <img src={heroFootball} alt="Football" className="h-56 w-full object-cover rounded-[1.75rem]" />
                  </motion.div>
                  <motion.div whileHover={{ y: -10 }} className="bg-white p-3 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-50">
                    <img src={heroCricket} alt="Cricket" className="h-44 w-full object-cover rounded-[1.75rem]" />
                  </motion.div>
                </div>
                <div className="space-y-6">
                  <motion.div whileHover={{ y: -10 }} className="bg-white p-3 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-50">
                    <img src={heroTennis} alt="Tennis" className="h-44 w-full object-cover rounded-[1.75rem]" />
                  </motion.div>
                  <motion.div whileHover={{ y: -10 }} className="bg-white p-3 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-50">
                    <img src={heroBadminton} alt="Badminton" className="h-56 w-full object-cover rounded-[1.75rem]" />
                  </motion.div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-slate-50 rounded-full -z-10 blur-3xl opacity-60" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Smart Features Strip */}
      <section className="bg-white py-16 border-y border-slate-50 relative z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                <FiClock />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Instant booking</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Book your court in seconds.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                <FiCheckCircle />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Verified venues</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Quality and safety guaranteed.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                <FiUsers />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Player community</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Join local games effortlessly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Sports */}
      <section className="py-32 bg-slate-50/30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 text-center md:text-left">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">Popular sports</h2>
              <p className="text-lg text-slate-400 mt-3 font-medium">Choose your game and find the best courts.</p>
            </div>
            <Link to="/venues" className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">
              Explore All <FiArrowRight />
            </Link>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8"
          >
            {sports.map((sport, idx) => (
              <motion.div key={idx} variants={listItemVariants}>
                <Link
                  to="/venues"
                  className="bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 rounded-[2.5rem] block h-full p-10 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-8 ${sport.color} group-hover:scale-110 transition-transform shadow-sm`}>
                      {sport.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 uppercase tracking-[0.2em] text-[10px] text-center">{sport.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-40 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">How it works</h2>
            <p className="text-lg text-slate-400 mt-4 font-medium uppercase tracking-widest text-xs">Get playing in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 relative">
            {/* Connector Lines (Desktop only) */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-[2px] bg-slate-50 -z-10" />

            <div className="text-center group">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-10 shadow-2xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500 relative">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-white border-4 border-slate-50 text-slate-900 rounded-full flex items-center justify-center text-xs font-black shadow-sm">1</span>
                <FiSearch />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 tracking-tight">Find venue</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Search for the nearest and best courts available around you.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-10 shadow-2xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500 relative">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-white border-4 border-slate-50 text-slate-900 rounded-full flex items-center justify-center text-xs font-black shadow-sm">2</span>
                <FiCheckCircle />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 tracking-tight">Book instant</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Reserve your time slot with our easy instant booking system.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-10 shadow-2xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500 relative">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-white border-4 border-slate-50 text-slate-900 rounded-full flex items-center justify-center text-xs font-black shadow-sm">3</span>
                <FiActivity />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 tracking-tight">Play now</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Head to the venue and experience play like never before.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Venues */}
      <section className="py-40 bg-slate-50/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 text-center md:text-left">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">Top-rated venues</h2>
              <p className="text-lg text-slate-400 mt-3 font-medium">The best places to play in your city.</p>
            </div>
            <Link to="/venues" className="hidden md:flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-white px-8 py-4 rounded-2xl border border-slate-100 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm">
              View All Venues <FiChevronRight />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto border-t-transparent"></div>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10"
            >
              {featuredVenues.length > 0 ? featuredVenues.map((venue) => (
                <motion.div key={venue._id} variants={listItemVariants}>
                  <Link
                    to={`/venues/${venue._id}`}
                    className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 block relative"
                  >
                    <div className="relative h-80 overflow-hidden">
                      {venue.images && venue.images.length > 0 ? (
                        <img
                          src={`http://localhost:5001${venue.images[0]}`}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                          <FiMapPin size={48} />
                        </div>
                      )}
                      <div className="absolute top-8 right-8 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl text-[10px] font-bold text-slate-900 flex items-center shadow-xl border border-white/20 uppercase tracking-widest">
                        <FiStar className="mr-2 fill-amber-400 text-amber-400" size={14} /> {venue.rating.average}
                      </div>
                    </div>
                    <div className="p-10">
                      <h3 className="text-2xl font-bold mb-3 text-slate-900 tracking-tight group-hover:text-slate-600 transition-colors uppercase">{venue.name}</h3>
                      <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest gap-2 mb-8">
                        <FiMapPin className="text-slate-900" />
                        <span>{venue.location.city}</span>
                      </div>
                      <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Starting from</span>
                        <span className="text-2xl font-bold text-slate-900 tracking-tighter">
                          Rs. {venue.basePrice}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )) : (
                <div className="col-span-full py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center">
                  <FiMapPin className="w-16 h-16 text-slate-100 mb-8" />
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No venues found nearby</p>
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-16 text-center md:hidden">
            <Link to="/venues" className="px-12 py-6 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 block w-full">Explore All Venues</Link>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-40 bg-white transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-slate-50/50 rounded-full -z-10 blur-3xl opacity-30" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">What our players say</h2>
            <p className="text-lg text-slate-400 mt-4 font-medium uppercase tracking-[0.2em] text-[10px]">Trusted by 2000+ athletes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            <div className="bg-white p-12 lg:p-16 rounded-[4rem] border border-slate-100 relative group transition-all duration-700 hover:shadow-2xl hover:-translate-y-2">
              <div className="absolute -top-6 left-12 w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-3xl font-serif">"</div>
              <p className="text-2xl text-slate-900 italic mb-12 font-medium leading-[1.6] tracking-tight">
                The booking experience is seamless. I found a great badminton court near my office in minutes!
              </p>
              <div className="flex items-center gap-5 pt-8 border-t border-slate-50">
                <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center font-bold text-slate-50 text-xl shadow-xl shadow-slate-900/10">ST</div>
                <div>
                  <div className="font-bold text-slate-900 text-lg tracking-tight">Sabina Thapa</div>
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Badminton player</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-12 lg:p-16 rounded-[4rem] border border-slate-100 relative group transition-all duration-700 hover:shadow-2xl hover:-translate-y-2">
              <div className="absolute -top-6 left-12 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl font-serif">"</div>
              <p className="text-2xl text-slate-900 italic mb-12 font-medium leading-[1.6] tracking-tight">
                As a venue owner, this platform has doubled my bookings. The dashboard is super easy to use.
              </p>
              <div className="flex items-center gap-5 pt-8 border-t border-slate-50">
                <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center font-bold text-white text-xl shadow-xl shadow-emerald-500/10">SD</div>
                <div>
                  <div className="font-bold text-slate-900 text-lg tracking-tight">Sagar Dahal</div>
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Venue owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer CTA */}
      <section className="py-40 bg-slate-900 relative overflow-hidden text-center mx-6 mb-12 rounded-[5rem] shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur rounded-full mb-10 border border-white/10">
              <FiTrendingUp className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Join the revolution</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-none">Ready to play?</h2>
            <p className="text-xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
              Join thousands of sports enthusiasts. Create your account today and experience sports like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register?role=customer" className="px-14 py-6 bg-white text-slate-900 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-2xl shadow-white/5 hover:-translate-y-2 transition-all active:scale-95">
                Join as player
              </Link>
              <Link to="/register?role=venue_owner" className="px-14 py-6 border-2 border-white/20 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all active:scale-95">
                Become a partner
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Home;
