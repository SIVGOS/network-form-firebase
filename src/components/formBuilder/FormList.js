import React, { useState, useEffect } from 'react';
import { Box, Button, Container, List, ListItem, ListItemText, Typography, TextField } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { formCollection, responseCollection } from '../../firebase';

const FormList = () => {
  const [forms, setForms] = useState([]);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const user_id = localStorage.getItem('user_id');
  

  useEffect(() => {
    fetchForms();
  }, [location]);

  const fetchForms = () => {
    getDocs(query(formCollection, where('user_id', '==',user_id)))
      .then((querySnapshot) => {
        const formList = [];
        querySnapshot.forEach((doc) => {
          const formData = doc.data();
          formList.push({ ...formData, id: doc.id });
        });
        console.log(formList)
        setForms(formList.sort((a, b) => b.modifiedAt.toDate() - a.modifiedAt.toDate()));
      })
      .catch((error) => {
        console.log('Error getting documents: ', error);
      });
  };

  const handleSelectForm = (form, action) => {
    if (action === 'edit') {
      navigate('/form-builder', { state: { form } });
    } else if (action === 'fill') {
      navigate('/form-response', { state: { form } });
    }
  };

  const deleteResponses = async(formId) => {
    const responses = await getDocs(query(
      responseCollection,
      where('formId', '==', formId)
    ));
    responses.forEach(resp => deleteDoc(doc(responseCollection, resp.id)));
  }

  const handleDeleteForm = async (formId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this form? This action cannot be undone.");
  
    if (isConfirmed) {
      try {
        await deleteResponses(formId);
        await deleteDoc(doc(formCollection, formId));
        setForms(forms.filter(form => form.id !== formId));
      } catch (error) {
        console.log('Error deleting form: ', error);
      }
    } else {
      // User canceled deletion
      console.log("Form deletion canceled.");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredForms = forms.filter(form => form.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Available Forms</Typography>
      <TextField
        fullWidth
        label="Search Forms"
        value={searchTerm}
        onChange={handleSearch}
        margin="normal"
      />
      <List>
        {filteredForms.map((form) => (
          <ListItem key={form.id}>
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
              <ListItemText
                primary={form.name}
                secondary={`Modified At: ${form.modifiedAt ? new Date(form.modifiedAt.toDate()).toLocaleString() : 'N/A'}`}
              />
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
