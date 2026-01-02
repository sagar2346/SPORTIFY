import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateDetails: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
};

// User services
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'address' && typeof data[key] === 'object') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    return api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getBookings: () => api.get('/users/bookings'),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (venueId) => api.post(`/users/wishlist/${venueId}`),
  removeFromWishlist: (venueId) => api.delete(`/users/wishlist/${venueId}`),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (notificationId) =>
    api.put(`/users/notifications/${notificationId}`),
  markAllNotificationsRead: () => api.put('/users/notifications/read-all/mark'),
  getAnalytics: () => api.get('/users/analytics'),
  getContacts: () => api.get('/users/contacts'),
  addContact: (data) => api.post('/users/contacts', data),
  sendContactEmail: (data) => api.post('/users/contacts/email', data),
};

// Venue services
export const venueService = {
  getVenues: (params) => api.get('/venues', { params }),
  getVenue: (id) => api.get(`/venues/${id}`),
  getAvailability: (id, date) =>
    api.get(`/venues/${id}/availability`, { params: { date } }),
  createVenue: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        data[key].forEach((item) => formData.append(key, item));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/venues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateVenue: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        data[key].forEach((item) => formData.append(key, item));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/venues/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteVenue: (id) => api.delete(`/venues/${id}`),
  getMyVenues: () => api.get('/venues/owner/my-venues'),
  blockDates: (id, data) => api.post(`/venues/${id}/block-dates`, data),
};

// Booking services
export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  confirmBooking: (id) => api.put(`/bookings/${id}/confirm`),
  cancelBooking: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
  rescheduleBooking: (id, data) => api.put(`/bookings/${id}/reschedule`, data),
  requestPaymentVerification: (id, method) => api.put(`/bookings/${id}/verify-payment`, { method }),
};

// Payment services
export const paymentService = {
  createPaymentIntent: (bookingId) =>
    api.post('/payments/create-intent', { bookingId }),
  getPaymentStatus: (bookingId) => api.get(`/payments/status/${bookingId}`),
};

// Review services
export const reviewService = {
  createReview: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        data[key].forEach((item) => formData.append(key, item));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getVenueReviews: (venueId) => api.get(`/reviews/venue/${venueId}`),
  updateReview: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        data[key].forEach((item) => formData.append(key, item));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/reviews/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// Admin services
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  approveVenueOwner: (userId) => api.put(`/admin/approve-owner/${userId}`),
  approveVenue: (venueId) => api.put(`/admin/approve-venue/${venueId}`),
  getAllBookings: () => api.get('/admin/bookings'),
  createDiscountCode: (data) => api.post('/admin/discount-codes', data),
  getDiscountCodes: () => api.get('/admin/discount-codes'),
  generateReports: (params) => api.get('/admin/reports', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  getOwnerRevenues: () => api.get('/admin/revenue-by-owner'),
  getPendingKyc: () => api.get('/admin/kyc/pending'),
  updateKycStatus: (userId, data) => api.put(`/admin/kyc/${userId}/status`, data),
};

// Inventory services
export const inventoryService = {
  getInventory: () => api.get('/inventory'),
  addItem: (data) => api.post('/inventory', data),
  updateItem: (id, data) => api.put(`/inventory/${id}`, data),
  deleteItem: (id) => api.delete(`/inventory/${id}`),
};

// Team services
export const teamService = {
  createTeam: (data) => api.post('/teams', data),
  joinTeam: (inviteCode) => api.post('/teams/join', { inviteCode }),
  getMyTeams: () => api.get('/teams'),
  getTeam: (id) => api.get(`/teams/${id}`),
  getMessages: (id) => api.get(`/teams/${id}/messages`),
  uploadVoice: (id, audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-message.webm');
    return api.post(`/teams/${id}/voice`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Message services
export const messageService = {
  sendMessage: (data) => api.post('/messages', data),
  getMessages: () => api.get('/messages'),
  getMyMessages: () => api.get('/messages/my'),
  replyToMessage: (id, reply) => api.post(`/messages/${id}/reply`, { reply }),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

// KYC services
export const kycService = {
  getKycStatus: () => api.get('/kyc/status'),
  uploadDocument: (formData) => api.post('/kyc/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default api;

