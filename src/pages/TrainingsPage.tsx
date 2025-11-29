import { useEffect, useState } from 'react';

import { AgGridReact } from '@ag-grid-community/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

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
import type { ColDef } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [quickFilter, setQuickFilter] = useState('');

  const fetchTrainings = () => {
    getTrainings()
      .then((data) => setTrainings(data))
      .catch((err) => console.error('Failed to fetch trainings:', err));
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  // We use the AgGridReact `quickFilterText` prop instead of calling setQuickFilter
  // on the API (some versions expose different shapes). This keeps the filter
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

  const [colDefs] = useState<ColDef<Training>[]>([
    {
      headerName: 'Actions',
      colId: 'actions',
      width: 90,
      pinned: 'left',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const id = params.data?.id ?? params.data?._links?.self?.href?.split('/')?.pop();
        return (
          <IconButton
            size="small"
            onClick={() => handleDelete(id)}
            aria-label="delete training"
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
    {
      headerName: 'Date',
      field: 'date',
      filter: true,
      sortable: true,
      flex: 1.4,
      minWidth: 180,
      valueFormatter: (params) =>
        dayjs(params.value).format('DD.MM.YYYY HH:mm'),
    },
    {
      field: 'activity',
      headerName: 'Activity',
      filter: true,
      sortable: true,
      flex: 1.2,
      minWidth: 140,
    },
    {
      field: 'duration',
      headerName: 'Duration (min)',
      filter: true,
      sortable: true,
      flex: 0.8,
      minWidth: 130,
    },
    {
      headerName: 'Customer',
      valueGetter: (params) => {
        const customer = params.data?.customer;
        return customer
          ? `${customer.firstname} ${customer.lastname}`
          : 'N/A';
      },
      filter: true,
      sortable: true,
      flex: 1.4,
      minWidth: 180,
    },
  ]);

  return (
    // OUTER: full width container — allow grid to stretch to the page
    <Box sx={{ width: '100%', display: 'block', mt: 2 }}>
      {/* INNER: use full width (remove centered maxWidth wrapper so table fills page) */}
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
        </Paper>

        {/* GRID */}
        <Paper sx={{ height: 600, width: '100%' }}>
          <Box className="ag-theme-material" sx={{ height: '100%', width: '100%' }}>
            <AgGridReact
              rowData={trainings}
              columnDefs={colDefs}
              pagination={true}
              paginationAutoPageSize={true}
              suppressRowClickSelection={true}
              quickFilterText={quickFilter}
              onGridReady={(params) => {
                // size columns to fit available width initially
                setTimeout(() => params.api.sizeColumnsToFit(), 50);
              }}
              onFirstDataRendered={(params) => params.api.sizeColumnsToFit()}
              defaultColDef={{ resizable: true }}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default TrainingsPage;
