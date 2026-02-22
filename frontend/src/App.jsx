import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerInventory from './pages/OwnerInventory';
import AdminDashboard from './pages/AdminDashboard';
// SuperAdminDashboard deleted
import NotFound from './pages/NotFound';
import AddVenue from './pages/AddVenue';
import EditVenue from './pages/EditVenue';
import UserManagement from './pages/UserManagement';
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

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatWidget from './components/ai/ChatWidget';

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
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
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

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-messages"
            element={
              <ProtectedRoute>
                <MyMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-teams"
            element={
              <ProtectedRoute>
                <TeamChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-friends"
            element={
              <ProtectedRoute>
                <MessageFriends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['venue_owner', 'admin']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/inventory"
            element={
              <ProtectedRoute allowedRoles={['venue_owner']}>
                <OwnerInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/venues/add"
            element={
              <ProtectedRoute allowedRoles={['venue_owner']}>
                <AddVenue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/venues/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['venue_owner']}>
                <EditVenue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/discount-codes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DiscountCodes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tournaments/create"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateTournament />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tournaments/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EditTournament />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" />
      <ChatWidget />
    </div>
  );
}

export default App;

