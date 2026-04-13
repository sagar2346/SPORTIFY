import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ForgotPassword from './ForgotPassword';
import { authService } from '../services/api';

// Mock services
vi.mock('../services/api', () => ({
  authService: {
    forgotPassword: vi.fn()
  }
}));

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders forgot password form correctly', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });

  it('submits email and shows success message', async () => {
    authService.forgotPassword.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'reset@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('reset@test.com');
      expect(screen.getByText(/Check Your Email/i)).toBeInTheDocument();
      expect(screen.getByText(/reset@test.com/i)).toBeInTheDocument();
    });
  });
});
