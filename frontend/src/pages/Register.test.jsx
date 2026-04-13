import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Register from './Register';

// Mock Auth context
const mockRegister = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null,
    loading: false
  })
}));

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form correctly', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('allows user to select a role', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const partnerBtn = screen.getByText('Partner');
    fireEvent.click(partnerBtn.closest('button'));
    
    // Check if the role selection visual indicator might have changed or internal state
    // We can't easily check internal state, but we can check if it stays active
    expect(partnerBtn.closest('button')).toHaveClass('bg-slate-900');
  });

  it('validates password matching on submit', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm/i), { target: { value: 'password456' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  it('submits form correctly when data is valid', async () => {
    mockRegister.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test User',
        email: 'test@test.com',
        role: 'customer'
      }));
    });
  });
});
