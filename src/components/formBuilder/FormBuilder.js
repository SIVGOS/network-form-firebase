import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { formCollection } from "../../firebase";
import inputTypes from './inputTypes.json';
import { TextField, Button, IconButton, Select, MenuItem, FormControl, InputLabel, Box, Container, Typography } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const FormBuilder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { form } = location.state || {};
  const [formName, setFormName] = useState(form?.name || '');
  const [formFields, setFormFields] = useState(form ? JSON.parse(form.schema) : []);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [additionalOption, setAdditionalOption] = useState('');
  const user_id = localStorage.getItem('user_id');
  const multiOptionFields = ['checkbox', 'radio', 'select']

  useEffect(() => {
    if (form) {
      setFormName(form.name);
      setFormFields(JSON.parse(form.schema));
    }
  }, [form]);

  const handleAddField = () => {
    console.log('In handle add field:', fieldName);
    if (!fieldName) {
      alert('Field name cannot be empty.');
    } else if(multiOptionFields.includes(fieldType) && newOption){
      alert(`Option ${newOption} is not added.`)
    } else {
      const newField = {
        type: fieldType,
        label: fieldName,
        options: multiOptionFields.includes(fieldType) ? options : undefined
      };
      setFormFields((prevFields) => [...prevFields, newField]);
      setFieldName('');
      setFieldType('text'); // Reset to default field type
      setOptions([]); // Reset options
    }
  };

  const handleRemoveField = (index) => {
    setFormFields((prevFields) => prevFields.filter((_, i) => i !== index));
  };

  const handleSaveForm = async () => {
    if (!formName) {
      alert('Form name cannot be empty');
    } else if (multiOptionFields.includes(fieldType) && newOption){
      alert(`Option ${newOption} is not added.`);
    } else if(fieldName){
      alert(`Field ${fieldName} is not added.`)
    } else {
      const formData = {
        name: formName,
        schema: JSON.stringify(formFields),
        user_id: user_id,
        modifiedAt: serverTimestamp()
      };

      if (form) {
        // Update existing form
        const formDoc = doc(formCollection, form.id);
        await updateDoc(formDoc, formData);
      } else {
        // Create new form
        await addDoc(formCollection, formData);
      }
      navigate('/form-list');
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions((prevOptions) => [...prevOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
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
          InputLabelProps={{
            required: true, shrink: true
          }}
          margin="normal"
        />
        <Box sx={{ mt: 4 }}>
          {formFields.map((field, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Field Name"
                value={field.label}
                onChange={(e) => {
                  const newFields = [...formFields];
                  newFields[index].label = e.target.value;
                  setFormFields(newFields);
                }}
                InputLabelProps={{ shrink: true, required: true }}
                margin="normal"
              />
              <FormControl fullWidth margin="normal" sx={{ ml: 2 }}>
                <InputLabel id={`option_${index}`}>Field Type</InputLabel>
                <Select
                  labelId={`option_${index}`}
                  label="Field Type"
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
              {multiOptionFields.includes(field.type) && (
                <Box sx={{ p: 2 }}>
                  {field.options.map((option, optionIndex) => (
                    <Box key={optionIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1, ml:4 }}>
                      <TextField
                        fullWidth
                        label={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newFields = [...formFields];
                          newFields[index].options[optionIndex] = e.target.value;
                          setFormFields(newFields);
                        }}
                        margin="normal"
                      />
                      <IconButton onClick={() => {
                        const newFields = [...formFields];
                        newFields[index].options.splice(optionIndex, 1);
                        setFormFields(newFields);
                      }}>
                        <DeleteIcon />
                      </IconButton>
                      <br/>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      label="Add Option"
                      value={additionalOption}
                      onChange={(e) => setAdditionalOption(e.target.value)}
                      margin="normal"
                    />
                    <Button onClick={() => {
                      if(additionalOption){
                        const newFields = [...formFields];
                        newFields[index].options.push(additionalOption);
                        setFormFields(newFields);
                        setAdditionalOption('');
                      }
                    }} sx={{ ml: 2 }}>
                      Add
                    </Button>
                  </Box>
                </Box>
              )}
              <Button variant="contained" color="error" onClick={()=>handleRemoveField(index)} sx={{ mt: 2 }}>
                Remove Field
              </Button>
          </Box>
          ))}
        </Box>
        <TextField
          fullWidth
          label="Enter Field Name"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          margin="normal"
          InputLabelProps={{
            shrink: true, required: true
          }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel shrink id='formtype-selector'>Field Type</InputLabel>
          <Select labelId='formtype-selector'
            label='Field Type'
            InputLabelProps={{
              shrink: true, required: true
            }}
            value={fieldType} onChange={(e) => setFieldType(e.target.value)}>
            {inputTypes.types.map((type) => (
              <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {multiOptionFields.includes(fieldType) && (
          <Box sx={{pl:3}}>
            {options.map((option, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  margin="normal"
                />
                <IconButton onClick={() => handleRemoveOption(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                label="Add Option"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                margin="normal"
              />
              <Button onClick={handleAddOption} sx={{ ml: 2 }}>
                Add
              </Button>
            </Box>
          </Box>
        )}
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
