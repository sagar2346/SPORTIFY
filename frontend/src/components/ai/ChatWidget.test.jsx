import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ChatWidget from './ChatWidget';
import { aiService } from '../../services/api';

// Mock services
vi.mock('../../services/api', () => ({
  aiService: {
    getChatReply: vi.fn(),
    getRecommendations: vi.fn(),
    getInsights: vi.fn()
  }
}));

// Mock Auth context
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatWidget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null }); // Guest mode by default
  });

  it('renders closed by default', () => {
    render(<ChatWidget />);
    expect(screen.getByLabelText(/Open AI Chat/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Ask something.../i)).not.toBeInTheDocument();
  });

  it('opens chat window when clicked', () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText(/Open AI Chat/i));
    expect(screen.getByPlaceholderText(/Ask something.../i)).toBeInTheDocument();
  });

  it('shows Guest Mode message when user is not logged in', async () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText(/Open AI Chat/i));
    
    const input = screen.getByPlaceholderText(/Ask something.../i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(screen.getByRole('form', { hidden: true })); // The form around input

    await waitFor(() => {
      expect(screen.getByText(/Please login to use me/i)).toBeInTheDocument();
    });
  });

  it('calls aiService when user is logged in', async () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Player', role: 'customer' } });
    aiService.getChatReply.mockResolvedValue({ data: { success: true, reply: 'Hello Player!' } });

    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText(/Open AI Chat/i));

    const input = screen.getByPlaceholderText(/Ask something.../i);
    fireEvent.change(input, { target: { value: 'Hi' } });
    
    // Find the send button or submit form
    const form = screen.getByPlaceholderText(/Ask something.../i).closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(aiService.getChatReply).toHaveBeenCalledWith('Hi');
      expect(screen.getByText(/Hello Player!/i)).toBeInTheDocument();
    });
  });
});
