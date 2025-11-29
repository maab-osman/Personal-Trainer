import { useEffect, useState } from 'react';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

import { getTrainings, deleteTrainingById, deleteTraining } from '../trainingapi';
import type { Training } from '../types';

import {
  Box,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';

function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [quickFilter, setQuickFilter] = useState('');

  const fetchTrainings = () => {
    getTrainings()
      .then((data) => {
        const mapped = (Array.isArray(data) ? data : []).map((t: any) => {
          const id = t.id ?? t?._links?.self?.href ?? `${t.date}-${t.activity}-${Math.random()}`;
          const customerName = t.customer ? `${t.customer.firstname} ${t.customer.lastname}` : 'N/A';
          return { ...t, id, customerName };
        });
        setTrainings(mapped);
      })
      .catch((err) => console.error('Failed to fetch trainings:', err));
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  //  AgGridReact `quickFilterText` prop instead of calling setQuickFilter
  // behavior stable across ag-grid versions.

  const handleDelete = (idOrUrl: string | number) => {
    if (!window.confirm('Do you want to delete this training?')) return;

    const doDelete = async () => {
      try {
        if (typeof idOrUrl === 'number' || /^[0-9]+$/.test(String(idOrUrl))) {
          await deleteTrainingById(idOrUrl);
        } else {
          await deleteTraining(String(idOrUrl));
        }
        fetchTrainings();
      } catch (err) {
        console.error('Failed to delete training:', err);
      }
    };

    void doDelete();
  };

  const columns: GridColDef[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params) => {
        const row: any = params.row;
        const id = row?.id ?? row?._links?.self?.href?.split('/')?.pop();
        return (
          <IconButton size="small" onClick={() => handleDelete(id)} aria-label="delete training">
            <DeleteIcon />
          </IconButton>
        );
      },
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1.4,
      minWidth: 180,
      sortable: true,
      renderCell: (params: any) => {
        const v = params?.row?.date ?? params?.value;
        return v ? dayjs(String(v)).format('DD.MM.YYYY hh:mm A') : '';
      },
    },
    {
      field: 'activity',
      headerName: 'Activity',
      flex: 1.2,
      minWidth: 140,
      sortable: true,
    },
    {
      field: 'duration',
      headerName: 'Duration (min)',
      flex: 0.8,
      minWidth: 130,
      sortable: true,
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      flex: 1.4,
      minWidth: 180,
      sortable: true,
    },
  ];

  return (
    // OUTER: full width container to allow grid to stretch to the page
    <Box sx={{ width: '100%', display: 'block', mt: 2 }}>
      <Box sx={{ width: '100%' }}>
        {/* Header row with search only */}
        <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search trainings"
            variant="outlined"
            size="small"
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            placeholder="Search by activity, customer..."
            sx={{ flex: 1 }}
          />
          {/* Toolbar with export will appear inside the DataGrid itself */}
        </Paper>

        {/* GRID */}
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={trainings}
            getRowId={(row) => row.id ?? (row as any)?._links?.self?.href ?? Math.random()}
            columns={columns}
            disableRowSelectionOnClick
            pagination
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true } }}
            sx={{ height: '100%', width: '100%' }}
          />
        </Paper>
      </Box>
    </Box>
  );
}

export default TrainingsPage;
