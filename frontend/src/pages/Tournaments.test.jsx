import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Tournaments from './Tournaments';
import { tournamentService } from '../services/api';

// Mock services
vi.mock('../services/api', () => ({
  tournamentService: {
    getTournaments: vi.fn()
  }
}));

const mockTournaments = [
  {
    _id: 't1',
    name: 'Winter League',
    status: 'open',
    startDate: new Date(),
    location: { city: 'Kathmandu' }
  }
];

describe('Tournaments Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tournament list correctly', async () => {
    tournamentService.getTournaments.mockResolvedValue({ data: { data: mockTournaments } });

    render(
      <BrowserRouter>
        <Tournaments />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Winter League')).toBeInTheDocument();
      expect(screen.getByText('OPEN')).toBeInTheDocument();
    });
  });

  it('shows empty state when no tournaments found', async () => {
    tournamentService.getTournaments.mockResolvedValue({ data: { data: [] } });

    render(
      <BrowserRouter>
        <Tournaments />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No tournaments available/i)).toBeInTheDocument();
    });
  });
});
