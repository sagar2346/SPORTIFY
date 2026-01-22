import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get role from query string
  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get('role');

  // Reset form when switching roles
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
    });
    setError('');
  }, [role]);

  const getTitle = () => {
    switch (role) {
      case 'admin': return 'Admin Login';
      case 'venue_owner': return 'Partner Login';
      case 'customer': return 'Customer Login';
      case 'super_admin': return 'Super Admin Portal';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (role) {
      case 'admin': return 'Sign in to manage the platform';
      case 'venue_owner': return 'Sign in to manage your venues';
      case 'user': return 'Sign in to book venues';
      default: return 'Login to your account';
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, role);

    if (!result.success) {
      // "No such credentials" (404) -> Toast 3s
      if (result.status === 404) {
        // Explicitly requesting 3 seconds
        const toastId = toast.error(result.message, { duration: 3000 });
      }
      // "Wrong credentials" (401) or other -> Inline on screen
      else {
        setError(result.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full glass rounded-2xl p-8 space-y-8 animate-fade-in relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <div className="text-center">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Sport<span className="text-emerald-600">Booking</span>
            </h2>
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              {getTitle()}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {getSubtitle()}
            </p>
            {!role && (
              <p className="mt-2 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            )}
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 animate-shake">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-bold">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  required
                  className="input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" title="Click here to reset your password" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="absolute bottom-4 text-center text-gray-500 text-xs">
        &copy; 2024 Sportify System. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
