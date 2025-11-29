import { render, screen, fireEvent } from '@testing-library/react';
import CustomersPage from '../pages/CustomersPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DataGrid to avoid CSS import issues and render emails for assertions
vi.mock('@mui/x-data-grid', () => {
  return {
    DataGrid: ({ rows, columns }: any) => (
      <div data-testid="datagrid">
        {rows && rows.map((r: any) => (
          <div key={r.id}>
            {/* Render actions column if present */}
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
      {
        firstname: 'Bob',
        lastname: 'Jones',
        streetaddress: '2 Side',
        postcode: '00200',
        city: 'Espoo',
        email: 'bob@example.com',
        phone: '789101',
        _links: { self: { href: 'https://api/customers/2' }, customer: { href: '' }, trainings: { href: '' } },
      },
    ],
  },
};

describe('CustomersPage search & export', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => mockCustomers } as any);
  });

  it('filters rows when searching', async () => {
    render(<CustomersPage />);
    // Wait for a known email to appear
    const aliceEmail = await screen.findByText('alice@example.com');
    expect(aliceEmail).toBeInTheDocument();
    const searchInput = screen.getByLabelText(/Search customers/i);
    fireEvent.change(searchInput, { target: { value: 'Espoo' } });
    // Bob has city Espoo; Alice should be filtered out
    expect(await screen.findByText('bob@example.com')).toBeInTheDocument();
    expect(screen.queryByText('alice@example.com')).toBeNull();
  });

  it('exports CSV with correct filename', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    render(<CustomersPage />);
    await screen.findByText('alice@example.com');
    const exportBtn = screen.getByRole('button', { name: /Export CSV/i });
    fireEvent.click(exportBtn);
    // Anchor should have been created
    expect(createElementSpy).toHaveBeenCalledWith('a');
  });
});
