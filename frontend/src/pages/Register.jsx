import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const roleParam = searchParams.get('role');
    if (roleParam === 'venue_owner' || roleParam === 'customer' || roleParam === 'admin' || roleParam === 'super_admin') {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);

    if (!result.success) {
      setError(result.message); // Inline error for "User already exists"
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full glass rounded-2xl p-8 space-y-8 animate-fade-in relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <div className="text-center">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Join <span className="text-emerald-600">Sportify</span>
            </h2>
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 animate-shake">
                <p className="text-sm text-red-700 font-bold text-center">{error}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="off"
                  required
                  className="input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="col-span-2 md:col-span-1">
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
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="off"
                  className="input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Role Selection */}
              <div className="col-span-2">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  I want to...
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center transition-all ${formData.role === 'customer'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200'
                      }`}
                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                  >
                    <span className="font-bold text-gray-800 text-sm">Customer</span>
                    <span className="text-xs text-gray-500 text-center mt-1">Book venues</span>
                  </div>
                  <div
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center transition-all ${formData.role === 'venue_owner'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200'
                      }`}
                    onClick={() => setFormData({ ...formData, role: 'venue_owner' })}
                  >
                    <span className="font-bold text-gray-800 text-sm">Owner</span>
                    <span className="text-xs text-gray-500 text-center mt-1">List venue</span>
                  </div>
                  <div
                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center transition-all ${formData.role === 'admin'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200'
                      }`}
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                  >
                    <span className="font-bold text-gray-800 text-sm">Admin</span>
                    <span className="text-xs text-gray-500 text-center mt-1">Manage</span>
                  </div>
                </div>
                {/* Hidden select for compatibility if needed, though state is managed manually above */}
                <select
                  id="role"
                  name="role"
                  className="sr-only"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="customer">Book venues</option>
                  <option value="venue_owner">List my venue</option>
                </select>
              </div>

              {/* Password */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  required
                  minLength={6}
                  className="input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="off"
                  required
                  className="input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-2">
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
                    Creating Account...
                  </span>
                ) : 'Create Account'}
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

export default Register;
