import React, { useState } from 'react';
import {signInWithEmailAndPassword, signOut} from 'firebase/auth';
import {auth} from '../../firebase'
import { Box, TextField, Button, Typography } from '@mui/material';
import { Navigate, redirect } from 'react-router-dom';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem('user_id', user.uid);
      localStorage.setItem('user_email', user.email);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ width: 300, padding: 4 }}>
        <Typography variant="h4" align="center">Sign In</Typography>
        <form onSubmit={handleSignIn}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="normal"
          />
          <Button type="submit" variant="contained" fullWidth color="primary">Sign In</Button>
        </form>
        {error && <Typography color="error">{error}</Typography>}
      </Box>
    </Box>
  );
}

export function handleSignOut() {
  console.log('logout');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_email');
  signOut(auth)
    .then(() => {
      console.log('User signed out successfully');
    })
    .catch((error) => {
      console.error('Error signing out: ', error);
    });
}


export default SignIn;
