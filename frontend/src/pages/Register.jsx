import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import PageWrapper from '../components/layout/PageWrapper';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    referralCode: '',
    adminSecret: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const { register, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'venue_owner') navigate('/owner/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const roleParam = searchParams.get('role');
    if (roleParam === 'venue_owner' || roleParam === 'customer' || roleParam === 'admin') {
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
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <PageWrapper className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden bg-slate-50">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-white rounded-full -ml-96 -mt-96 blur-3xl opacity-60" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-slate-100 rounded-full -mr-32 -mb-32 blur-3xl opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[720px] w-full relative z-10"
      >
        <div className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-2xl shadow-slate-900/5 border border-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-slate-50 rounded-full -ml-16 -mt-16" />

          <div className="relative text-center mb-12">
            <Link to="/" className="inline-block mb-6 group">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500">S</div>
            </Link>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Create Your Account
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Join the Sportify community today
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest">{error}</p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Full Name */}
              <div className="col-span-2 space-y-3">
                <label htmlFor="name" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <FiUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-100 pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/10 transition-all font-bold text-slate-900 placeholder:text-slate-200"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-100 pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/10 transition-all font-bold text-slate-900 placeholder:text-slate-200"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-3">
                <label htmlFor="phone" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Phone (Optional)
                </label>
                <div className="relative group">
                  <FiPhone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full bg-slate-50 border border-slate-100 pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/10 transition-all font-bold text-slate-900 placeholder:text-slate-200"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="col-span-2 space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  I want to...
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'customer', label: 'Player', sub: 'Book venues' },
                    { id: 'venue_owner', label: 'Partner', sub: 'List venue' },
                    { id: 'admin', label: 'Admin', sub: 'Manage' }
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      className={`relative p-6 rounded-[2rem] border text-left transition-all duration-300 group ${formData.role === role.id
                        ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-y-[-4px]'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      onClick={() => setFormData({ ...formData, role: role.id })}
                    >
                      {formData.role === role.id && (
                        <FiCheckCircle className="absolute top-4 right-4 text-white/40" size={14} />
                      )}
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${formData.role === role.id ? 'text-white' : 'text-slate-900'}`}>
                        {role.label}
                      </p>
                      <p className={`text-[9px] font-medium uppercase tracking-widest opacity-60`}>
                        {role.sub}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-3">
                <label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Password
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="w-full bg-slate-50 border border-slate-100 pl-14 pr-14 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/10 transition-all font-bold text-slate-900 placeholder:text-slate-200"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-300 hover:text-slate-900 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-3">
                <label htmlFor="confirmPassword" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Confirm
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-slate-50 border border-slate-100 pl-14 pr-14 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/10 transition-all font-bold text-slate-900 placeholder:text-slate-200"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-300 hover:text-slate-900 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Referral Code (Hidden for Admin) */}
              {formData.role !== 'admin' && (
                <div className="col-span-2 space-y-3">
                  <label htmlFor="referralCode" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Referral code (optional)
                  </label>
                  <input
                    name="referralCode"
                    type="text"
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/10 transition-all font-bold text-slate-900 placeholder:text-slate-200 text-xs"
                    placeholder="e.g. SPORT-123456"
                    value={formData.referralCode}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Admin Secret Code (Conditional) */}
              {formData.role === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="col-span-2 space-y-3"
                >
                  <label htmlFor="adminSecret" className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <FiShield size={12} /> Admin secret code
                  </label>
                  <div className="relative group">
                    <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-300 transition-colors" />
                    <input
                      name="adminSecret"
                      type={showAdminSecret ? 'text' : 'password'}
                      required
                      className="w-full bg-rose-50/30 border border-rose-100 pl-14 pr-14 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/5 focus:bg-white focus:border-rose-300 transition-all font-bold text-slate-900 placeholder:text-rose-200"
                      placeholder="Access restricted"
                      value={formData.adminSecret}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-6 flex items-center text-rose-300 hover:text-rose-600 transition-colors"
                      onClick={() => setShowAdminSecret(!showAdminSecret)}
                    >
                      {showAdminSecret ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl shadow-slate-900/10 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center gap-3 group mt-12"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-slate-900 hover:text-slate-600 transition-colors underline underline-offset-8 decoration-slate-200 hover:decoration-slate-900"
              >
                Sign In Here
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
          &copy; 2024 Sportify Inc.
        </p>
      </motion.div>
    </PageWrapper>
  );
};

export default Register;

