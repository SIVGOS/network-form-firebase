import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import SignIn from './components/login';
import FormBuilder from './components/formBuilder/FormBuilder';
import FormList from './components/formBuilder/FormList';
import FormResponse from './components/formBuilder/FormResponse'; // Import the new component
import './App.css';
import useAuth from './contextx/auth'
import { auth } from './firebase';
const App = () => {
  const user = useAuth();

  const handleLogout = () => {
    auth.signOut();
  };

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
                <Button color="inherit" component={Link} to="/form-builder">
                  Form Builder
                </Button>
                <Button color="inherit" component={Link} to="/form-list">
                  Form List
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </Toolbar>
            </AppBar>
            <Container>
              <Routes>
                <Route path="/form-builder" element={<FormBuilder />} />
                <Route path="/form-list" element={<FormList />} />
                <Route path="/form-response" element={<FormResponse />} />
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
