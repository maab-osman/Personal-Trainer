// src/App.tsx
import React, { type FC, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import { styled, useTheme } from '@mui/material/styles';
import AppBarMui from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';

import CustomersPage from './pages/CustomersPage';
import TrainingsPage from './pages/TrainingsPage';
import CalendarPage from './pages/CalendarPage';
import StatisticsPage from './pages/StatisticsPage';
import ErrorBoundary from './components/ErrorBoundary';

const drawerWidth = 240;

type MenuItem = {
  text: string;
  path: string;
  icon: React.ReactElement;
};

// Styled AppBar that shifts right when drawer is open
const AppBar = styled(AppBarMui, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// Header area inside drawer
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar, // same height as AppBar
}));

const App: FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const menuItems: MenuItem[] = [
    { text: 'Customers', path: '/customers', icon: <PeopleIcon /> },
    { text: 'Trainings', path: '/trainings', icon: <FitnessCenterIcon /> },
    { text: 'Calendar', path: '/calendar', icon: <CalendarMonthIcon /> },
    { text: 'Statistics', path: '/statistics', icon: <BarChartIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* TOP BAR */}
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }} // hide when open
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Personal Trainer
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SIDE DRAWER */}
      <Drawer
        sx={{
          // Collapse the drawer to zero width when closed so main content
          // can use the full page width. When open, use the configured drawerWidth.
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 0,
            boxSizing: 'border-box',
            overflowX: 'hidden',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {/* "<" close button */}
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: 0,
          ...(open && {
            marginLeft: `${drawerWidth}px`,
          }),
        }}
      >
        {/* spacing under AppBar */}
        <Toolbar />
        <Routes>
          <Route path="/" element={<CustomersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route
            path="/trainings"
            element={
              <ErrorBoundary>
                <TrainingsPage />
              </ErrorBoundary>
            }
          />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
