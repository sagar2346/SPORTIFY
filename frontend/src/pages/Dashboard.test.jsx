import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Dashboard from './Dashboard';
import { userService, footageService } from '../services/api';

// Mock services
vi.mock('../services/api', () => ({
  userService: {
    getBookings: vi.fn(),
    getAnalytics: vi.fn(),
    getNotifications: vi.fn()
  },
  footageService: {
    getAll: vi.fn()
  }
}));

// Mock Auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user123', name: 'Test Player', role: 'customer' }
  })
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userService.getBookings.mockResolvedValue({ data: { data: [] } });
    userService.getAnalytics.mockResolvedValue({ data: { data: { totalBookings: 5, completedBookings: 3, totalSpent: 4500 } } });
    userService.getNotifications.mockResolvedValue({ data: { data: [] } });
    footageService.getAll.mockResolvedValue({ data: { data: [] } });
  });

  it('renders analytics data correctly', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // totalBookings
      expect(screen.getByText('3')).toBeInTheDocument(); // completedBookings
      expect(screen.getByText(/Rs. 4500/i)).toBeInTheDocument(); // totalSpent
    });
  });

  it('renders quick action links', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Book venues/i)).toBeInTheDocument();
      expect(screen.getByText(/My bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/My teams/i)).toBeInTheDocument();
    });
  });
});
