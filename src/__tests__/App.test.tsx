import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock DataGrid to avoid CSS import issues from MUI X
vi.mock('@mui/x-data-grid', () => {
  return {
    DataGrid: ({ rows }: any) => (
      <div data-testid="datagrid">{rows && rows.map((r: any) => <div key={r.id}>{r.email}</div>)}</div>
    ),
    GridToolbarQuickFilter: () => <input aria-label="Quick filter" />,
  };
});

// Mock fetch to avoid network dependency for initial pages
beforeAll(() => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ _embedded: { customers: [] } }),
  } as any);
});

describe('App root rendering', () => {
  it('renders Customers heading on initial load', () => {
    render(
      <MemoryRouter initialEntries={['/Personal-Trainer/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Customers/i)).toBeInTheDocument();
  });
});
