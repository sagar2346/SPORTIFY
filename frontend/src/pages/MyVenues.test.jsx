import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import MyVenues from './MyVenues';
import { venueService } from '../services/api';

// Mock services
vi.mock('../services/api', () => ({
  venueService: {
    getMyVenues: vi.fn(),
    deleteVenue: vi.fn()
  }
}));

const mockVenues = [
  {
    _id: 'v1',
    name: 'My Futsal',
    location: { address: 'A', city: 'C' },
    sportTypes: ['Futsal'],
    isApproved: true,
    basePrice: 1500,
    images: ['/img.jpg']
  }
];

describe('MyVenues Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    venueService.getMyVenues.mockResolvedValue({ data: { data: mockVenues } });
  });

  it('renders my venues list correctly', async () => {
    render(
      <BrowserRouter>
        <MyVenues />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My Futsal')).toBeInTheDocument();
      expect(screen.getByText('Rs. 1500')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
  });

  it('filters venues based on search term', async () => {
    render(
      <BrowserRouter>
        <MyVenues />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('My Futsal'));
    
    const searchInput = screen.getByPlaceholderText(/Search venues/i);
    fireEvent.change(searchInput, { target: { value: 'Non-existent' } });

    expect(screen.queryByText('My Futsal')).not.toBeInTheDocument();
    expect(screen.getByText(/No venues found/i)).toBeInTheDocument();
  });
});
