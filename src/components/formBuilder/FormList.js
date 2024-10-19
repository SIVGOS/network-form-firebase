import React, { useState, useEffect } from 'react';
import { Box, Button, Container, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getDocs, deleteDoc, doc } from 'firebase/firestore';
import { formCollection } from '../../firebase'; // Firebase configuration file

const FormList = () => {
  const [forms, setForms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of form names from the 'formSchema' collection in Firebase
    getDocs(formCollection)
      .then((querySnapshot) => {
        const formList = [];
        querySnapshot.forEach((doc) => {
          const formData = doc.data();
          formList.push({ ...formData, id: doc.id });
        });
        setForms(formList);
      })
      .catch((error) => {
        console.log('Error getting documents: ', error);
      });
  }, []);

  const handleSelectForm = (form, action) => {
    if (action === 'edit') {
      navigate('/form-builder', { state: { form } });
    } else if (action === 'fill') {
      navigate('/form-response', { state: { form } });
    }
  };

  const handleDeleteForm = async (formId) => {
    try {
      await deleteDoc(doc(formCollection, formId));
      setForms(forms.filter(form => form.id !== formId));
    } catch (error) {
      console.log('Error deleting form: ', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Available Forms</Typography>
      <List>
        {forms.map((form) => (
          <ListItem key={form.id} button>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                bgcolor: 'background.paper',
                p: 2,
                mb: 1,
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <ListItemText primary={form.name} />
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSelectForm(form, 'edit')}
                  style={{ marginRight: '10px' }}
                >
                  Edit Form
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSelectForm(form, 'fill')}
                  style={{ marginRight: '10px' }}
                >
                  Fill Form
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteForm(form.id)}
                >
                  Delete Form
                </Button>
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default FormList;
