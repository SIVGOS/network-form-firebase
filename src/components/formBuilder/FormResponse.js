import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { addDoc } from 'firebase/firestore';
import { responseCollection } from '../../firebase'; // Firebase configuration file
import { Container, Box, Typography, TextField, Button } from '@mui/material';
import useAuth from '../../contextx/auth';

const FormResponse = () => {
  const location = useLocation();
  const { form } = location.state || {};
  const [responses, setResponses] = useState({});
  const user = useAuth();

  useEffect(() => {
    if (form) {
      const initialResponses = {};
      const formFields = JSON.parse(form.schema);
      formFields.forEach(field => {
        initialResponses[field.label] = '';
      });
      setResponses(initialResponses);
    }
  }, [form]);

  const handleChange = (label, value) => {
    setResponses({
      ...responses,
      [label]: value,
    });
  };

  const handleSubmit = async () => {
    const response = {
      userId: user.uid,
      userEmail: user.email,
      formId: form.id,
      formName: form.name,
      responses,
    };

    try {
      await addDoc(responseCollection, response);
      alert('Response submitted successfully');
    } catch (error) {
      console.log('Error submitting response: ', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {form.name}
        </Typography>
        {form && JSON.parse(form.schema).map((field, index) => (
          <TextField
            key={index}
            fullWidth
            label={field.label}
            value={responses[field.label] || ''}
            onChange={(e) => handleChange(field.label, e.target.value)}
            margin="normal"
          />
        ))}
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
          Submit Response
        </Button>
      </Box>
    </Container>
  );
};

export default FormResponse;
