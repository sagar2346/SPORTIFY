import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await authService.getMe();
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Load User Error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, requiredRole = null) => {
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;

      // Enforce role check
      if (requiredRole && user.role !== requiredRole) {
        throw new Error(`Unauthorized. This login is restricted to ${requiredRole}s only.`);
      }

      // 1. Set localStorage first
      localStorage.setItem('token', token);

      // 2. Update state in a single batch if possible, or order them logically
      setToken(token);
      setUser(user);

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      const status = error.response?.status;
      return { success: false, message, status };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { user } = response.data;

      // Do NOT auto-login. Redirect to login page.
      toast.success('Registration successful! Please log in.');

      // Role-based redirect to login using navigate
      navigate(`/login?role=${user.role}`, { 
        replace: true,
        state: { email: user.email }
      });

      return { success: true };
    } catch (error) {
      // Return error structure to component
      let message = error.response?.data?.message || 'Registration failed';

      // Handle array of errors from express-validator
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        message = error.response.data.errors.map(err => err.msg).join(', ');
      }

      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

