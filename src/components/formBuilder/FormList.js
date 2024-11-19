import React, { useState, useEffect } from 'react';
import { Box, Button, Container, List, ListItem, ListItemText, Typography, TextField,  Menu, MenuItem } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDocs, deleteDoc, doc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { formCollection, responseCollection } from '../../firebase';

const FormList = () => {
  const [forms, setForms] = useState([]);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
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

  const handleCopyForm = async (form) => {
    const formData = {
      name: `Copy of ${form.name}`,
      schema: form.schema,
      user_id: user_id,
      modifiedAt: serverTimestamp()
    };
    await addDoc(formCollection, formData);
    fetchForms();
  }

  const handleDownloadForm = async(form) => {
    const downloadData = {
      name: form.name,
      createdBy: localStorage.getItem('user_email'),
      schema: form.schema
    };
    const data = new Blob([JSON.stringify(downloadData, null, 4)], { type: 'text/plain' });
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
                    aria-controls="action-menu"
                    aria-haspopup="true"
                    onClick={(event) => handleMenuOpen(event)}
                    variant="contained"
                    color="primary"
                  >
                    Actions
                  </Button>
                  <Menu
                    id="action-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => { handleSelectForm(form, 'edit') ; handleMenuClose(); }}>Edit From</MenuItem>
                    <MenuItem onClick={() => { handleSelectForm(form, 'fill'); handleMenuClose(); }}>Fill Form</MenuItem>
                    <MenuItem onClick={() => { handleDeleteForm(form.id); handleMenuClose(); }}>Delete Form</MenuItem>
                    <MenuItem onClick={() => { handleCopyForm(form); handleMenuClose(); }}>Copy Form</MenuItem>
                    <MenuItem onClick={() => { handleDownloadForm(form); handleMenuClose(); }}>Download Form</MenuItem>
                  </Menu>
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default FormList;
