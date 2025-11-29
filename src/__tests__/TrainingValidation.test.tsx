import { render, screen, fireEvent } from '@testing-library/react';
import CustomersPage from '../pages/CustomersPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DataGrid to avoid CSS import issues and surface email text
vi.mock('@mui/x-data-grid', () => {
  return {
    DataGrid: ({ rows, columns }: any) => (
      <div data-testid="datagrid">
        {rows && rows.map((r: any) => (
          <div key={r.id}>
            {columns && columns.map((col: any) => col.field === 'actions' && col.renderCell ? col.renderCell({ row: r }) : null)}
            <div>{r.email}</div>
          </div>
        ))}
      </div>
    ),
    GridToolbarQuickFilter: () => <input aria-label="Quick filter" />,
  };
});

const mockCustomers = {
  _embedded: {
    customers: [
      {
        firstname: 'Alice',
        lastname: 'Smith',
        streetaddress: '1 Main',
        postcode: '00100',
        city: 'Helsinki',
        email: 'alice@example.com',
        phone: '123456',
        _links: { self: { href: 'https://api/customers/1' }, customer: { href: '' }, trainings: { href: '' } },
      },
    ],
  },
};

describe('Training dialog validation', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => mockCustomers } as any);
  });

  it('blocks save when required fields are empty or invalid', async () => {
    render(<CustomersPage />);
    await screen.findByText('alice@example.com');
    // Open training dialog
    const addTrainingLink = screen.getByRole('button', { name: /ADD TRAINING/i });
    fireEvent.click(addTrainingLink);
    // Duration is blank by design; activity blank and date valid initially
    const saveBtn = screen.getByRole('button', { name: /Save Training/i });
    expect(saveBtn).toBeDisabled();
    // Fill activity and duration
    const activityInput = screen.getByLabelText(/Activity/i);
    fireEvent.change(activityInput, { target: { value: 'Running' } });
    const durationInput = screen.getByLabelText(/Duration \(minutes\)/i);
    fireEvent.change(durationInput, { target: { value: '45' } });
    // Button should now enable
    expect(saveBtn).not.toBeDisabled();
  });
});
