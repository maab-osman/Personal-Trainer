// src/pages/CustomersPage.tsx
import { type FC, useEffect, useMemo, useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  Box,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Link,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const API_BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';

type CustomerLinks = {
  self: { href: string };
  customer: { href: string };
  trainings: { href: string };
};

export type Customer = {
  id: string; // derived from self link (for DataGrid)
  firstname: string;
  lastname: string;
  streetaddress: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
  _links: CustomerLinks;
};

type CustomerResponse = {
  _embedded: {
    customers: Omit<Customer, 'id'>[];
  };
};

const CustomersPage: FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  // Training dialog state
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [selectedCustomerForTraining, setSelectedCustomerForTraining] = useState<Customer | null>(null);
  const [trainingForm, setTrainingForm] = useState({
    date: dayjs(),
    activity: '',
    duration: 0,
  });
  const [savingTraining, setSavingTraining] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/customers`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = (await response.json()) as CustomerResponse;

        const customersWithId: Customer[] =
          data._embedded?.customers?.map((c) => {
            const selfHref = c._links.self.href;
            const parts = selfHref.split('/');
            const id = parts[parts.length - 1];
            return {
              id,
              ...c,
            };
          }) ?? [];

        setCustomers(customersWithId);
      } catch (err) {
        console.error(err);
        setError('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const columns: GridColDef[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Link
            component="button"
            variant="body2"
            sx={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'none', fontWeight: 500 }}
            onClick={() => {
              setSelectedCustomerForTraining(params.row);
              setTrainingForm({ date: dayjs(), activity: '', duration: 0 });
              setTrainingDialogOpen(true);
            }}
          >
            ADD TRAINING
          </Link>
          <IconButton
            aria-label="edit"
            size="small"
            onClick={() => {
              setEditingCustomer(params.row);
              setDialogOpen(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="delete"
            size="small"
            onClick={() => {
              if (
                window.confirm(
                  `Delete ${params.row.firstname} ${params.row.lastname}? This will remove associated trainings.`
                )
              ) {
                // delete by id
                fetch(`${API_BASE_URL}/customers/${params.row.id}`, {
                  method: 'DELETE',
                })
                  .then((res) => {
                    if (!res.ok) throw new Error('Delete failed');
                    // refresh list
                    setCustomers((prev) => prev.filter((c) => c.id !== params.row.id));
                  })
                  .catch((err) => console.error(err));
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    { field: 'firstname', headerName: 'First name', flex: 1, minWidth: 120 },
    { field: 'lastname', headerName: 'Last name', flex: 1, minWidth: 120 },
    { field: 'email', headerName: 'Email', flex: 1.4, minWidth: 180 },
    { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 140 },
    {
      field: 'city',
      headerName: 'City',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'streetaddress',
      headerName: 'Address',
      flex: 1.4,
      minWidth: 180,
    },
  ];

  // Filter customers by search text
  const filteredRows = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return customers;

    return customers.filter((c) =>
      [
        c.firstname,
        c.lastname,
        c.email,
        c.phone,
        c.city,
        c.streetaddress,
        c.postcode,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [customers, search]);

  const handleExportCsv = () => {
    // Build CSV from filteredRows and exclude actions
    const headers = ['firstname', 'lastname', 'email', 'phone', 'city', 'streetaddress', 'postcode'];
    const rows = filteredRows.map((r) => headers.map((h) => JSON.stringify((r as any)[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDialogSave = async (customer: Partial<Customer>) => {
    try {
      setSaving(true);
      if (editingCustomer) {
        // PUT update
        const res = await fetch(`${API_BASE_URL}/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer),
        });
        if (!res.ok) throw new Error('Update failed');
        // update local
        setCustomers((prev) => prev.map((c) => (c.id === editingCustomer.id ? { ...c, ...(customer as any) } : c)));
      } else {
        // POST create
        const res = await fetch(`${API_BASE_URL}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer),
        });
        if (!res.ok) throw new Error('Create failed');
        const created = await res.json();
        // derive id from _links.self.href if present
        const selfHref = created._links?.self?.href;
        const id = selfHref ? String(selfHref).split('/').pop() : String(Date.now());
        setCustomers((prev) => [{ id, ...created }, ...prev]);
      }
      setDialogOpen(false);
      setEditingCustomer(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTraining = async () => {
    if (!selectedCustomerForTraining) return;

    try {
      setSavingTraining(true);
      const customerUrl = selectedCustomerForTraining._links.self.href;
      const trainingData = {
        date: trainingForm.date.toISOString(),
        activity: trainingForm.activity,
        duration: trainingForm.duration,
        customer: customerUrl,
      };

      const res = await fetch(`${API_BASE_URL}/trainings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingData),
      });

      if (!res.ok) throw new Error('Failed to save training');
      setTrainingDialogOpen(false);
      setSelectedCustomerForTraining(null);
      setTrainingForm({ date: dayjs(), activity: '', duration: 0 });
    } catch (err) {
      console.error('Failed to save training:', err);
    } finally {
      setSavingTraining(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Customers
      </Typography>

      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search customers"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, city..."
          sx={{ flex: 1 }}
        />
        <Button variant="outlined" onClick={() => { setEditingCustomer(null); setDialogOpen(true); }}>
          Add Customer
        </Button>
        <Button variant="contained" onClick={handleExportCsv}>
          Export CSV
        </Button>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Paper sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            disableRowSelectionOnClick
            sortingOrder={['asc', 'desc']}
          />
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingCustomer ? 'Edit customer' : 'Add customer'}</DialogTitle>
        <DialogContent>
          {/* Simple form - reuse fields from Customer */}
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField label="First name" defaultValue={editingCustomer?.firstname ?? ''} id="firstname" />
            <TextField label="Last name" defaultValue={editingCustomer?.lastname ?? ''} id="lastname" />
            <TextField label="Email" defaultValue={editingCustomer?.email ?? ''} id="email" />
            <TextField label="Phone" defaultValue={editingCustomer?.phone ?? ''} id="phone" />
            <TextField label="Street" defaultValue={editingCustomer?.streetaddress ?? ''} id="streetaddress" />
            <TextField label="Postcode" defaultValue={editingCustomer?.postcode ?? ''} id="postcode" />
            <TextField label="City" defaultValue={editingCustomer?.city ?? ''} id="city" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const c = {
                firstname: (document.getElementById('firstname') as HTMLInputElement).value,
                lastname: (document.getElementById('lastname') as HTMLInputElement).value,
                email: (document.getElementById('email') as HTMLInputElement).value,
                phone: (document.getElementById('phone') as HTMLInputElement).value,
                streetaddress: (document.getElementById('streetaddress') as HTMLInputElement).value,
                postcode: (document.getElementById('postcode') as HTMLInputElement).value,
                city: (document.getElementById('city') as HTMLInputElement).value,
              } as Partial<Customer>;
              void handleDialogSave(c);
            }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Training Dialog */}
      <Dialog open={trainingDialogOpen} onClose={() => setTrainingDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Training for {selectedCustomerForTraining?.firstname} {selectedCustomerForTraining?.lastname}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Date and time"
                value={trainingForm.date}
                onChange={(newValue) => setTrainingForm({ ...trainingForm, date: newValue! })}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
            <TextField
              label="Activity"
              fullWidth
              value={trainingForm.activity}
              onChange={(e) => setTrainingForm({ ...trainingForm, activity: e.target.value })}
              variant="outlined"
            />
            <TextField
              label="Duration (minutes)"
              fullWidth
              type="number"
              value={trainingForm.duration}
              onChange={(e) => setTrainingForm({ ...trainingForm, duration: Number(e.target.value) })}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrainingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTraining} disabled={savingTraining}>
            {savingTraining ? 'Saving...' : 'Save Training'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomersPage;
