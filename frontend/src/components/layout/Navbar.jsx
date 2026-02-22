import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiLogOut, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [signupDropdownOpen, setSignupDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const signupDropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLoginDropdownOpen(false);
      }
      if (signupDropdownRef.current && !signupDropdownRef.current.contains(event.target)) {
        setSignupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderNavLinks = (isMobile = false) => {
    const linkClass = isMobile
      ? "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
      : "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600";

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
          <Link to="/dashboard" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Dashboard</Link>
        )}

        {/* Venue Owner Links */}
        {user.role === 'venue_owner' && (
          <>
            <Link to="/owner/dashboard" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Owner Dashboard</Link>
            <Link to="/venues/add" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Create Venue</Link>
            <Link to="/owner/inventory" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Manage Inventory</Link>
          </>
        )}

        {/* Admin Links */}
        {user.role === 'admin' && (
          <>
            <Link to="/admin/dashboard" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Admin Dashboard</Link>
            <Link to="/venues" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>View Available Venue</Link>
            <Link to="/admin/users" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Manage Users</Link>
            <Link to="/admin/tournaments/create" className={linkClass} onClick={() => isMobile && setMobileMenuOpen(false)}>Create Tournament</Link>
          </>
        )}
      </>
    );
  };

  return (
    <nav className="bg-white shadow-md relative z-50" style={{ borderTop: '4px solid #0A2540' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold" style={{ color: '#0A2540' }}>
              Sportify
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {renderNavLinks(false)}

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 flex items-center"
                >
                  <FiUser className="mr-1" />
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 flex items-center"
                >
                  <FiLogOut className="mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 flex items-center"
                  >
                    Login <FiChevronDown className="ml-1" />
                  </button>

                  {loginDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 animate-fade-in-down">
                      <Link
                        to="/login?role=customer"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setLoginDropdownOpen(false)}
                      >
                        Customer Login
                      </Link>
                      <Link
                        to="/login?role=venue_owner"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setLoginDropdownOpen(false)}
                      >
                        Partner Login
                      </Link>
                      <Link
                        to="/login?role=admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setLoginDropdownOpen(false)}
                      >
                        Admin Login
                      </Link>

                    </div>
                  )}
                </div>

                <div className="relative" ref={signupDropdownRef}>
                  <button
                    onClick={() => setSignupDropdownOpen(!signupDropdownOpen)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 flex items-center"
                  >
                    Sign Up <FiChevronDown className="ml-1" />
                  </button>

                  {signupDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 animate-fade-in-down">
                      <Link
                        to="/register?role=customer"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setSignupDropdownOpen(false)}
                      >
                        Customer Signup
                      </Link>
                      <Link
                        to="/register?role=venue_owner"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setSignupDropdownOpen(false)}
                      >
                        Owner Signup
                      </Link>
                      <Link
                        to="/register?role=admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setSignupDropdownOpen(false)}
                      >
                        Admin Signup
                      </Link>

                    </div>
                  )}
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
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
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
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Login As</p>
                  <Link
                    to="/login?role=customer"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Customer
                  </Link>
                  <Link
                    to="/login?role=venue_owner"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Partner/Owner
                  </Link>
                  <Link
                    to="/login?role=admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sign Up As</p>
                  <Link
                    to="/register?role=customer"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Customer
                  </Link>
                  <Link
                    to="/register?role=venue_owner"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Partner/Owner
                  </Link>
                  <Link
                    to="/register?role=admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Signup
                  </Link>
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
