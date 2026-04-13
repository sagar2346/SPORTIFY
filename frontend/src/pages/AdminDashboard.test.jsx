import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { adminService, bookingService, venueService } from '../services/api';

// Mock services
vi.mock('../services/api', () => ({
  adminService: {
    getDashboard: vi.fn(),
    getOwnerRevenues: vi.fn(),
    approveVenue: vi.fn()
  },
  bookingService: {
    confirmBooking: vi.fn(),
    cancelBooking: vi.fn(),
    deleteBooking: vi.fn()
  },
  venueService: {
    deleteVenue: vi.fn()
  }
}));

// Mock sub-components
vi.mock('./admin/CustomerMessages', () => ({ default: () => <div>Messages Tab</div> }));
vi.mock('./admin/KycVerificationRequests', () => ({ default: () => <div>KYC Tab</div> }));
vi.mock('./admin/AdminFootage', () => ({ default: () => <div>Footage Tab</div> }));
vi.mock('./admin/ManageTournaments', () => ({ default: () => <div>Tournaments Tab</div> }));

const mockDashboard = {
  stats: {
    totalUsers: 100,
    totalVenues: 10,
    totalBookings: 50,
    totalRevenue: 50000
  },
  pendingPayments: [
    {
      _id: 'b1',
      venue: { name: 'Super Court' },
      user: { name: 'John Doe' },
      totalPrice: 2000,
      payment: { method: 'esewa' }
    }
  ],
  pendingVenues: [
    {
      _id: 'v1',
      name: 'New Arena',
      owner: { name: 'Owner Jack' }
    }
  ]
};

describe('AdminDashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.getDashboard.mockResolvedValue({ data: { data: mockDashboard } });
    adminService.getOwnerRevenues.mockResolvedValue({ data: { data: [] } });
  });

  it('renders stats correctly', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // totalUsers
      expect(screen.getByText('10')).toBeInTheDocument();  // totalVenues
      expect(screen.getByText('50')).toBeInTheDocument();  // totalBookings
      expect(screen.getByText(/Rs. 50000/i)).toBeInTheDocument();
    });
  });

  it('allows switching tabs', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('Overview'));
    
    fireEvent.click(screen.getByText('Messages'));
    expect(screen.getByText('Messages Tab')).toBeInTheDocument();

    fireEvent.click(screen.getByText('KYC'));
    expect(screen.getByText('KYC Tab')).toBeInTheDocument();
  });

  it('calls approveVenue when Approve button is clicked', async () => {
    adminService.approveVenue.mockResolvedValue({ success: true });
    
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('Approve Venue'));
    fireEvent.click(screen.getByText('Approve Venue'));

    expect(adminService.approveVenue).toHaveBeenCalledWith('v1');
  });
});
