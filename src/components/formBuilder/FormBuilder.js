import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { addDoc, updateDoc, doc } from 'firebase/firestore';
import { formCollection } from "../../firebase";
import inputTypes from './inputTypes.json';
import { TextField, Button, IconButton, Select, MenuItem, FormControl, InputLabel, Box, Container, Typography } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const FormBuilder = () => {
  const location = useLocation();
  const { form } = location.state || {};
  const [formName, setFormName] = useState(form?.name || '');
  const [formFields, setFormFields] = useState(form ? JSON.parse(form.schema) : []);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text');

  useEffect(() => {
    if (form) {
      setFormName(form.name);
      setFormFields(JSON.parse(form.schema));
    }
  }, [form]);

  const handleAddField = () => {
    const newField = {
      type: fieldType,
      label: fieldName,
    };
    setFormFields((prevFields) => [...prevFields, newField]);
    setFieldName('');
    setFieldType('text'); // Reset to default field type
  };

  const handleRemoveField = (index) => {
    setFormFields((prevFields) => prevFields.filter((_, i) => i !== index));
  };

  const handleSaveForm = () => {
    const formData = {
      name: formName,
      schema: JSON.stringify(formFields),
    };

    if (form) {
      // Update existing form
      const formDoc = doc(formCollection, form.id);
      updateDoc(formDoc, formData);
    } else {
      // Create new form
      addDoc(formCollection, formData);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Form Builder
        </Typography>
        <TextField
          fullWidth
          label="Enter Form Name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          margin="normal"
        />

        <Box sx={{ mt: 4 }}>
          {formFields.map((field, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                fullWidth
                label="Field Name"
                value={field.label}
                onChange={(e) => {
                  const newFields = [...formFields];
                  newFields[index].label = e.target.value;
                  setFormFields(newFields);
                }}
                margin="normal"
              />
              <FormControl fullWidth margin="normal" sx={{ ml: 2 }}>
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={field.type}
                  onChange={(e) => {
                    const newFields = [...formFields];
                    newFields[index].type = e.target.value;
                    setFormFields(newFields);
                  }}
                >
                  {inputTypes.types.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton onClick={() => handleRemoveField(index)} sx={{ ml: 2 }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        <TextField
          fullWidth
          label="Enter Field Name"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Field Type</InputLabel>
          <Select value={fieldType} onChange={(e) => setFieldType(e.target.value)}>
            {inputTypes.types.map((type) => (
              <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleAddField} sx={{ mt: 2 }}>
          Add Field
        </Button>
        <Button variant="contained" color="secondary" onClick={handleSaveForm} sx={{ mt: 2, ml: 2 }}>
          Save Form
        </Button>
      </Box>
    </Container>
  );
};

export default FormBuilder;
