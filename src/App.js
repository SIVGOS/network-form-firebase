import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SignIn, { handleSignOut } from './components/login';
import FormBuilder from './components/formBuilder/FormBuilder';
import FormList from './components/formBuilder/FormList';
import FormResponse from './components/formBuilder/FormResponse';
import FormResponseList from './components/formBuilder/ResponseList';
import useAuth from './contextx/auth';
import './App.css';

const App = () => {
  const { user, loading } = useAuth();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (loading) {
    return <div className="spinner"></div>; 
  }

  const drawer = (
    <div>
      <List>
        <ListItem button component={Link} to="/form-builder" onClick={handleDrawerToggle}>
          <ListItemText primary="Form Builder" />
        </ListItem>
        <ListItem button component={Link} to="/form-list" onClick={handleDrawerToggle}>
          <ListItemText primary="Form List" />
        </ListItem>
        <ListItem button component={Link} to="/response-list" onClick={handleDrawerToggle}>
          <ListItemText primary="Response List" />
        </ListItem>
        <ListItem button onClick={() => { handleSignOut(); handleDrawerToggle(); }}>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Router>
      <div>
        {user ? (
          <>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Dynamic Form Builder
                </Typography>
                {isMobile ? (
                  <>
                    <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="menu"
                      onClick={handleDrawerToggle}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Drawer
                      anchor="right"
                      open={drawerOpen}
                      onClose={handleDrawerToggle}
                    >
                      {drawer}
                    </Drawer>
                  </>
                ) : (
                  <>
                    <Button color="inherit" component={Link} to="/form-builder">
                      Form Builder
                    </Button>
                    <Button color="inherit" component={Link} to="/form-list">
                      Form List
                    </Button>
                    <Button color="inherit" component={Link} to="/response-list">
                      Response List
                    </Button>
                    <Button color="inherit" onClick={handleSignOut}>
                      Logout
                    </Button>
                  </>
                )}
              </Toolbar>
            </AppBar>
            <Container>
              <Routes>
                <Route path="/form-builder" element={<FormBuilder />} />
                <Route path="/form-list" element={<FormList />} />
                <Route path="/form-response" element={<FormResponse />} />
                <Route path="/response-list" element={<FormResponseList />} />
                <Route path="*" element={<Navigate to="/form-builder" />} />
              </Routes>
            </Container>
          </>
        ) : (
          <SignIn />
        )}
      </div>
    </Router>
  );
};

export default App;
