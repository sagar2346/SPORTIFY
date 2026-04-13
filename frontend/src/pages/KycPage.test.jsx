import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import KycPage from './KycPage';

// Mock KycVerification component
vi.mock('../components/customer/KycVerification', () => ({
  default: () => <div data-testid="kyc-verification-mock">KycVerification Mock</div>
}));

describe('KycPage', () => {
  it('renders KycPage correctly', () => {
    render(
      <BrowserRouter>
        <KycPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Identity Verification/i)).toBeInTheDocument();
    expect(screen.getByTestId('kyc-verification-mock')).toBeInTheDocument();
    expect(screen.getByText(/Why verify\?/i)).toBeInTheDocument();
  });
});
