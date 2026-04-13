import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import FootageView from './FootageView';
import { footageService } from '../services/api';

// Mock services
vi.mock('../services/api', () => ({
  footageService: {
    get: vi.fn(),
    getSummary: vi.fn(),
    query: vi.fn(),
    exportReport: vi.fn()
  }
}));

// Mock YouTube API
window.YT = {
  Player: vi.fn().mockImplementation(() => ({
    destroy: vi.fn()
  }))
};

const mockFootage = {
  _id: 'f1',
  title: 'Match Highlights',
  description: 'Great game',
  videoUrl: 'https://youtube.com/watch?v=123',
  analysisText: 'Good performance',
  createdAt: new Date().toISOString()
};

describe('FootageView Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    footageService.get.mockResolvedValue({ data: { data: mockFootage } });
  });

  it('renders footage details correctly', async () => {
    render(
      <BrowserRouter>
        <FootageView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Match Highlights')).toBeInTheDocument();
      expect(screen.getByText('Great game')).toBeInTheDocument();
      expect(screen.getByText(/Good performance/i)).toBeInTheDocument();
    });
  });

  it('calls getSummary when Generate AI Summary is clicked', async () => {
    footageService.getSummary.mockResolvedValue({ data: { summary: 'Tactical summary' } });

    render(
      <BrowserRouter>
        <FootageView />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText(/Generate AI Summary/i));
    fireEvent.click(screen.getByText(/Generate AI Summary/i));

    await waitFor(() => {
      expect(footageService.getSummary).toHaveBeenCalledWith('f1');
      expect(screen.getByText('Tactical summary')).toBeInTheDocument();
    });
  });

  it('allows asking questions via Tactical Assistant', async () => {
    footageService.query.mockResolvedValue({ data: { reply: 'AI response to tactics' } });

    render(
      <BrowserRouter>
        <FootageView />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByPlaceholderText(/Ask about the game/i));
    const input = screen.getByPlaceholderText(/Ask about the game/i);
    fireEvent.change(input, { target: { value: 'How was the defense?' } });
    
    // Find the button with FiActivity
    const submitBtn = screen.getByPlaceholderText(/Ask about the game/i).nextSibling;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(footageService.query).toHaveBeenCalledWith('f1', 'How was the defense?');
      expect(screen.getByText('AI response to tactics')).toBeInTheDocument();
    });
  });
});
