import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Venues from './pages/Venues';
import VenueDetail from './pages/VenueDetail';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import MyMessages from './pages/MyMessages';
import Profile from './pages/Profile';
import KycPage from './pages/KycPage';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerInventory from './pages/OwnerInventory';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import AddVenue from './pages/AddVenue';
import EditVenue from './pages/EditVenue';
import UserManagement from './pages/UserManagement';
import MyVenues from './pages/MyVenues';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import FootageView from './pages/FootageView';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import SportsSelection from './pages/SportsSelection';
import SportBooking from './pages/SportBooking';
import DiscountCodes from './pages/DiscountCodes';
import TeamChat from './pages/customer/TeamChat';
import MessageFriends from './pages/customer/MessageFriends';
import AnalyticsBoard from './pages/customer/AnalyticsBoard';
import CreateTournament from './pages/admin/CreateTournament';
import EditTournament from './pages/admin/EditTournament';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import TicketDownload from './pages/TicketDownload';
import OwnerAnalytics from './pages/OwnerAnalytics';
import ManageTeams from './pages/admin/ManageTeams';
import AdminFootage from './pages/admin/AdminFootage';
import KycVerificationRequests from './pages/admin/KycVerificationRequests';
import CustomerMessages from './pages/admin/CustomerMessages';
import ManageTournaments from './pages/admin/ManageTournaments';
import EsewaSuccess from './pages/EsewaSuccess';
import EsewaFailure from './pages/EsewaFailure';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatWidget from './components/ai/ChatWidget';
import AdminLayout from './components/layout/AdminLayout';
import CustomerLayout from './components/layout/CustomerLayout';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();

  // Define routes that should have a sidebar/management layout
  const isManagementPage = [
    '/dashboard',
    '/bookings',
    '/my-teams',
    '/my-messages',
    '/analytics',
    '/profile',
    '/kyc',
    '/message-friends',
  ].some((path) => location.pathname.startsWith(path)) || location.pathname.startsWith('/admin') || location.pathname.startsWith('/owner');
  
  const isOwnerPage = location.pathname.startsWith('/owner');

  useEffect(() => {
    // Force body background to match layout to prevent "white gap" separation
    if (isManagementPage || isOwnerPage) {
      document.body.style.backgroundColor = '#f3f4f6'; // Gray-100
    } else {
      document.body.style.backgroundColor = '#ffffff'; // Pure white
    }
    
    // Cleanup on unmount or route change
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [isManagementPage, isOwnerPage, location.pathname]);

  return (
    <div className={`min-h-screen ${isManagementPage ? 'bg-gray-100' : 'bg-slate-50'} font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900`}>
      {!isManagementPage && <Navbar />}
      <main className={`relative ${isManagementPage ? 'fixed inset-0 z-0' : 'flex-grow min-h-screen'}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/footage/:id" element={<FootageView />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:id" element={<VenueDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/sports" element={<SportsSelection />} />
            <Route path="/sports/:sportType" element={<SportBooking />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />

            {/* Shared Management Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['customer', 'venue_owner', 'admin']}>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/profile" element={<Profile />} />
              <Route path="/kyc" element={<KycPage />} />
            </Route>

            {/* Player management routes with Sidebar Layout */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/bookings/:id" element={<BookingDetail />} />
              <Route path="/my-messages" element={<MyMessages />} />
              <Route path="/my-teams" element={<TeamChat />} />
              <Route path="/message-friends" element={<MessageFriends />} />
              <Route path="/analytics" element={<AnalyticsBoard />} />
            </Route>

            <Route
              path="/bookings/:id/ticket/download"
              element={<TicketDownload />}
            />

            {/* Owner Management Routes (Now with Sidebar) */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['venue_owner', 'admin']}>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              <Route path="/owner/my-venues" element={<MyVenues />} />
              <Route path="/owner/inventory" element={<OwnerInventory />} />
              <Route path="/owner/analytics" element={<OwnerAnalytics />} />
              <Route path="/owner/edit-venue/:id" element={<EditVenue />} />
              <Route path="/owner/add-venue" element={<AddVenue />} />
            </Route>

            {/* Payment Callbacks */}
            <Route
              path="/payment/esewa/success"
              element={
                <ProtectedRoute>
                  <EsewaSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/esewa/failure"
              element={
                <ProtectedRoute>
                  <EsewaFailure />
                </ProtectedRoute>
              }
            />

            {/* Admin Layout & Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="kyc-requests" element={<KycVerificationRequests />} />
              <Route path="messages" element={<CustomerMessages />} />
              <Route path="tournaments" element={<ManageTournaments />} />
              <Route path="tournaments/create" element={<CreateTournament />} />
              <Route path="tournaments/edit/:id" element={<EditTournament />} />
              <Route path="teams" element={<ManageTeams />} />
              <Route path="footage" element={<AdminFootage />} />
              <Route path="teams-chat" element={<TeamChat />} />
              <Route path="discount-codes" element={<DiscountCodes />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isManagementPage && <Footer />}
      <Toaster position="top-right" />
      {!isManagementPage && <ChatWidget />}
    </div>
  );
}

export default App;
