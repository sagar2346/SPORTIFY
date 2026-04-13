import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import OwnerInventory from './OwnerInventory';
import { inventoryService } from '../services/api';

// Mock services
vi.mock('../services/api', () => ({
  inventoryService: {
    getInventory: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn()
  }
}));

const mockInventory = [
  {
    _id: 'i1',
    name: 'Football',
    sport: 'Football',
    quantity: 10,
    condition: 'New'
  }
];

describe('OwnerInventory Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inventoryService.getInventory.mockResolvedValue({ data: { success: true, data: mockInventory } });
  });

  it('renders inventory list correctly', async () => {
    render(
      <BrowserRouter>
        <OwnerInventory />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Football')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('opens add item modal when clicked', async () => {
    render(
      <BrowserRouter>
        <OwnerInventory />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('Add Item'));
    fireEvent.click(screen.getByText('Add Item'));

    expect(screen.getByText('Add New Item')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Professional Football/i)).toBeInTheDocument();
  });
});
