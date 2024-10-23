// FormResponse.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { responseCollection } from '../../firebase';
import { Container, Box, Typography, TextField, Button } from '@mui/material';

const FormResponse = () => {
  const location = useLocation();
  const { form, responses: initialResponses } = location.state || {};
  const [responses, setResponses] = useState(initialResponses || {});
  const user_id = localStorage.getItem('user_id');
  const user_email = localStorage.getItem('user_email');
  const navigate = useNavigate()

  useEffect(() => {
    if (form) {
      const formFields = JSON.parse(form.schema);
      const filledResponses = formFields.reduce((acc, field) => {
        acc[field.label] = initialResponses ? initialResponses[field.label] : '';
        return acc;
      }, {});
      setResponses(filledResponses);
    }
  }, [form, initialResponses]);

  const handleChange = (label, value) => {
    setResponses({
      ...responses,
      [label]: value,
    });
  };

  const handleSubmit = async () => {
    const response = {
      userId: user_id,
      userEmail: user_email,
      formId: form.id,
      formName: form.name,
      modifiedOn: serverTimestamp(),
      responses,
    };

    try {
      if (initialResponses) {
        await setDoc(doc(responseCollection, initialResponses.id), response);
        alert('Response updated successfully');
      } else {
        await addDoc(responseCollection, response);
        alert('Response submitted successfully');
      }
    } catch (error) {
      console.log('Error submitting response: ', error);
    }

    navigate('/response-list')
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
            type={field.type}
            value={responses[field.label] || ''}
            onChange={(e) => handleChange(field.label, e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true
            }}
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
