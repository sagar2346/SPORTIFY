import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import Contact from './Contact';
import { messageService } from '../services/api';

// Mock services
vi.mock('../services/api', () => ({
  messageService: {
    sendMessage: vi.fn()
  }
}));

// Mock assets
vi.mock('../assets/contact_map.png', () => ({ default: 'mock-map.png' }));

// Mock Auth context
const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login if user not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/contact']}>
        <Routes>
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders contact form when user is authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Player', email: 'player@test.com' }, loading: false });

    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    expect(screen.getByText(/Contact us/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Player')).toBeInTheDocument();
    expect(screen.getByDisplayValue('player@test.com')).toBeInTheDocument();
  });

  it('submits message correctly', async () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Player', email: 'player@test.com' }, loading: false });
    messageService.sendMessage.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/How can we help/i), { target: { value: 'Bug report' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe your request/i), { target: { value: 'I found a bug' } });
    
    fireEvent.submit(screen.getByRole('button', { name: /Send message/i }).closest('form'));

    await waitFor(() => {
      expect(messageService.sendMessage).toHaveBeenCalledWith({
        name: 'Player',
        email: 'player@test.com',
        subject: 'Bug report',
        message: 'I found a bug'
      });
    });
  });
});
