import React, { useState } from 'react';
import {signInWithEmailAndPassword, signOut} from 'firebase/auth';
import {auth} from '../../firebase'
import { Box, TextField, Button, Typography } from '@mui/material';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      console.log('Signed in successfully:', user);
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
  signOut(auth);
}

export default SignIn;
