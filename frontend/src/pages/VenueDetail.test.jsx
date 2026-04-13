import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import VenueDetail from './VenueDetail';
import { venueService, bookingService, aiService, reviewService } from '../services/api';

// Mock services
vi.mock('../services/api', () => ({
  venueService: {
    getVenue: vi.fn(),
    getAvailability: vi.fn()
  },
  bookingService: {
    createBooking: vi.fn()
  },
  aiService: {
    getVenueSummary: vi.fn()
  },
  reviewService: {
    getVenueReviews: vi.fn()
  }
}));

// Mock Auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user123', name: 'Test User' }
  })
}));

const mockVenue = {
  _id: 'venue123',
  name: 'Elite Arena',
  description: 'Top notch arena',
  location: { address: 'Address', city: 'City' },
  rating: { average: 4.5, count: 10 },
  facilities: ['Parking', 'Water'],
  images: ['/image1.jpg'],
  basePrice: 1000,
  capacity: 10
};

describe('VenueDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    venueService.getVenue.mockResolvedValue({ data: { data: mockVenue } });
    reviewService.getVenueReviews.mockResolvedValue({ data: { data: [] } });
    venueService.getAvailability.mockResolvedValue({ data: { data: { slots: [{ startTime: '10:00', endTime: '11:00', isAvailable: true }] } } });
  });

  it('renders venue details correctly', async () => {
    render(
      <BrowserRouter>
        <VenueDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Elite Arena')).toBeInTheDocument();
      expect(screen.getByText('Top notch arena')).toBeInTheDocument();
    });
  });

  it('allows selecting a time slot and calculating price', async () => {
    render(
      <BrowserRouter>
        <VenueDetail />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('Start'));
    
    const startSelect = screen.getByRole('combobox', { name: /start/i });
    fireEvent.change(startSelect, { target: { value: '10:00' } });

    expect(screen.getByText(/Total cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Rs. 1000/i)).toBeInTheDocument();
  });
});
