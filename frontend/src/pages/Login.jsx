import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import PageWrapper from '../components/layout/PageWrapper';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get('role');

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'venue_owner') navigate('/owner/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // 1. Reset password on every role/mount
    setFormData(prev => ({ ...prev, password: '' }));

    // 2. Check registration state
    if (location.state?.email) {
      // Only pre-fill if the role matches the registered role (passed in query param)
      setFormData(prev => ({ ...prev, email: location.state.email }));
      return;
    }

    // 3. Role-specific "Remember Me"
    const storageKey = `sportify_remembered_email_${role || 'default'}`;
    const savedEmail = localStorage.getItem(storageKey);
    
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    } else {
      setFormData(prev => ({ ...prev, email: '' }));
      setRememberMe(false);
    }
  }, [role, location.state]);

  const getTitle = () => {
    switch (role) {
      case 'admin': return 'Admin Login';
      case 'venue_owner': return 'Partner Login';
      case 'customer': return 'Player Login';
      case 'super_admin': return 'Super Admin Portal';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (role) {
      case 'admin': return 'Manage the Sportify platform';
      case 'venue_owner': return 'Manage your venues and bookings';
      case 'customer': return 'Book your next game instantly';
      default: return 'Login to your account';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Map custom names back to formData keys
    const fieldName = name.includes('sportify_login_') 
      ? name.replace('sportify_login_', '') 
      : name;
      
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password, role);

    if (result.success) {
      const storageKey = `sportify_remembered_email_${role || 'default'}`;
      if (rememberMe) {
        localStorage.setItem(storageKey, formData.email);
      } else {
        localStorage.removeItem(storageKey);
      }
    } else {
      toast.error(result.message);
      if (result.status === 404) {
        setFormData({ email: '', password: '' });
      } else {
        setFormData(prev => ({ ...prev, password: '' }));
      }
    }
    setLoading(false);
  };

  return (
    <PageWrapper className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden bg-slate-50">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-white rounded-full -mr-96 -mt-96 blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-slate-100 rounded-full -ml-32 -mb-32 blur-3xl opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[480px] w-full relative z-10"
      >
        <div className="bg-white rounded-[3rem] p-12 lg:p-16 shadow-2xl shadow-slate-900/5 border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16" />

          <div className="relative text-center mb-12">
            <Link to="/" className="inline-block mb-8 group">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500">S</div>
            </Link>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
              {getTitle()}
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              {getSubtitle()}
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="sportify_login_email" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    id="sportify_login_email"
                    name="sportify_login_email"
                    type="email"
                    required
                    autoComplete="username"
                    className="w-full bg-slate-50 border border-slate-100 pl-14 pr-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/10 transition-all font-bold text-slate-900 placeholder:text-slate-200"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="sportify_login_password" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Password
                  </label>
                  <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-slate-900 transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    id="sportify_login_password"
                    name="sportify_login_password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="w-full bg-slate-50 border border-slate-100 pl-14 pr-16 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-900/10 transition-all font-bold text-slate-900 placeholder:text-slate-200"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-300 hover:text-slate-900 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center ml-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 text-slate-900 border-slate-200 rounded-lg focus:ring-slate-900/5 transition-all cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] cursor-pointer hover:text-slate-600 transition-colors">
                Keep Me Signed In
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl shadow-slate-900/10 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              New to Sportify?{' '}
              <Link
                to={`/register${role ? `?role=${role}` : ''}`}
                className="text-slate-900 hover:text-slate-600 transition-colors underline underline-offset-8 decoration-slate-200 hover:decoration-slate-900"
              >
                Create An Account
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

export default Login;

