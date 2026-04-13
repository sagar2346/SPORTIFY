import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiLogOut, FiMenu, FiX, FiChevronDown, FiGrid, FiMapPin, FiUsers, FiAward, FiShield, FiActivity, FiBarChart2 } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tapScale } from '../../utils/motion';



const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const signupDropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);
  const dashboardDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown) {
        const refs = [dropdownRef, signupDropdownRef, adminDropdownRef, dashboardDropdownRef];
        const isOutsideAll = refs.every(ref => !ref.current || !ref.current.contains(event.target));

        if (isOutsideAll) {
          setActiveDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderNavLinks = (isMobile = false) => {
    const linkClass = isMobile
      ? "block px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-all"
      : "px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors";

    const commonLinks = (
      <>
        <Link to="/" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Home</Link>
        {(!user || (user.role !== 'venue_owner' && user.role !== 'admin')) && (
          <>
            <Link to="/about" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Contact</Link>
            <Link to="/tournaments" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Tournaments</Link>
          </>
        )}
      </>
    );

    if (!user) {
      return (
        <>
          {commonLinks}
          <Link to="/sports" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Book Sports</Link>
          <Link to="/venues" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Venues</Link>
        </>
      );
    }

    return (
      <>
        {commonLinks}
        {user.role !== 'admin' && user.role !== 'venue_owner' && (
          <Link to="/sports" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Book Sports</Link>
        )}

        {/* Customer Links */}
        {user.role === 'customer' && (
          isMobile ? (
            <>
              <Link to="/dashboard" className={linkClass} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/my-teams" className={linkClass} onClick={() => setMobileMenuOpen(false)}>Team Chat</Link>
            </>
          ) : (
            <div className="relative" ref={dashboardDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(prev => prev === 'dashboard' ? null : 'dashboard');
                }}
                className={linkClass + " flex items-center group"}
              >
                Dashboard <FiChevronDown className={`ml-1 transition-transform ${activeDropdown === 'dashboard' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeDropdown === 'dashboard' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden"
                  >
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <FiGrid className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/my-teams"
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <FiUsers className="w-4 h-4" />
                      <span>Team chat</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        )}

        {/* Venue Owner Links */}
        {user.role === 'venue_owner' && (
          isMobile ? (
            <>
              <Link to="/owner/dashboard" className={linkClass} onClick={() => setMobileMenuOpen(false)}>Owner Dashboard</Link>
              <Link to="/owner/add-venue" className={linkClass} onClick={() => setMobileMenuOpen(false)}>Create Venue</Link>
              <Link to="/owner/inventory" className={linkClass} onClick={() => setMobileMenuOpen(false)}>Manage Inventory</Link>
            </>
          ) : (
            <div className="relative" ref={dashboardDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(prev => prev === 'dashboard' ? null : 'dashboard');
                }}
                className={linkClass + " flex items-center group"}
              >
                Owner Dashboard <FiChevronDown className={`ml-1 transition-transform ${activeDropdown === 'dashboard' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeDropdown === 'dashboard' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden"
                  >
                    <Link
                      to="/owner/dashboard"
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <FiGrid className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/owner/add-venue"
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <FiMapPin className="w-4 h-4" />
                      <span>Create venue</span>
                    </Link>
                    <Link
                      to="/owner/inventory"
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <FiActivity className="w-4 h-4" />
                      <span>Manage inventory</span>
                    </Link>
                    <Link
                      to="/owner/analytics"
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <FiBarChart2 className="w-4 h-4" />
                      <span>View analytics</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        )}

        {/* Admin Links */}
        {user.role === 'admin' && (
          <div className="relative" ref={adminDropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(prev => prev === 'admin' ? null : 'admin');
              }}
              className={linkClass + " flex items-center group"}
            >
              Management <FiChevronDown className={`ml-1 transition-transform ${activeDropdown === 'admin' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`${isMobile ? 'pl-4 mt-2' : 'absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden'}`}
                >
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => { setActiveDropdown(null); isMobile && setMobileMenuOpen(false); }}
                  >
                    <FiGrid className="w-4 h-4" />
                    <span>Admin dashboard</span>
                  </Link>
                  <Link
                    to="/venues"
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => { setActiveDropdown(null); isMobile && setMobileMenuOpen(false); }}
                  >
                    <FiMapPin className="w-4 h-4" />
                    <span>View available venues</span>
                  </Link>
                  <Link
                    to="/admin/users"
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => { setActiveDropdown(null); isMobile && setMobileMenuOpen(false); }}
                  >
                    <FiUsers className="w-4 h-4" />
                    <span>Manage users</span>
                  </Link>
                  <Link
                    to="/admin/teams"
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => { setActiveDropdown(null); isMobile && setMobileMenuOpen(false); }}
                  >
                    <FiShield className="w-4 h-4" />
                    <span>Manage teams</span>
                  </Link>
                  <Link
                    to="/admin/tournaments/create"
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => { setActiveDropdown(null); isMobile && setMobileMenuOpen(false); }}
                  >
                    <FiAward className="w-4 h-4" />
                    <span>Create tournament</span>
                  </Link>
                  <Link
                    to="/admin/teams-chat"
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => { setActiveDropdown(null); isMobile && setMobileMenuOpen(false); }}
                  >
                    <FiShield className="w-4 h-4" />
                    <span>Team chat</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </>
    );
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-black tracking-tight">
              Sportify
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {renderNavLinks(false)}


            {user ? (
              <div className="flex items-center space-x-1">
                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center transition-colors"
                >
                  <FiUser className="mr-2" />
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 flex items-center transition-colors"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(prev => prev === 'login' ? null : 'login');
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 flex items-center"
                  >
                    Login <FiChevronDown className="ml-1" />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === 'login' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border"
                      >
                        <Link
                          to="/login?role=customer"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Customer Login
                        </Link>
                        <Link
                          to="/login?role=venue_owner"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Partner Login
                        </Link>
                        <Link
                          to="/login?role=admin"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Admin Login
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative" ref={signupDropdownRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(prev => prev === 'signup' ? null : 'signup');
                    }}
                    className="btn btn-primary ml-2 py-2"
                  >
                    Get started <FiChevronDown className={`transition-transform duration-200 ${activeDropdown === 'signup' ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border"
                      >
                        <Link
                          to="/register?role=customer"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Customer Signup
                        </Link>
                        <Link
                          to="/register?role=venue_owner"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Partner Signup
                        </Link>
                        <Link
                          to="/register?role=admin"
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Admin Signup
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavLinks(true)}

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-slate-100 pt-4 mt-4 px-4 pb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Login</p>
                  <div className="grid grid-cols-1 gap-1">
                    <Link to="/login?role=customer" className="py-2 text-slate-600 font-medium" onClick={() => setMobileMenuOpen(false)}>As player</Link>
                    <Link to="/login?role=venue_owner" className="py-2 text-slate-600 font-medium" onClick={() => setMobileMenuOpen(false)}>As partner</Link>
                    <Link to="/login?role=admin" className="py-2 text-slate-600 font-medium" onClick={() => setMobileMenuOpen(false)}>As admin</Link>
                  </div>
                </div>
                <div className="px-4 py-4">
                  <Link to="/register?role=customer" className="btn btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>Get started</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
