// FormResponse.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { responseCollection } from '../../firebase';
import { Container, Box, FormControl, FormControlLabel, Checkbox, Radio, RadioGroup, Typography, TextField, Button,
        InputLabel, Select, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';


const useStyles = makeStyles({
  formControl: {
    margin: '16px 0',
    minWidth: 120,
  },
  submitButton: {
    margin: '16px 0',
  },
});

const FormResponse = () => {
  const location = useLocation();
  const { form, responses: initialResponses } = location.state || {};
  const [responses, setResponses] = useState(initialResponses || {});
  const [responseLabel, setResponseLabel] = useState('');
  const user_id = localStorage.getItem('user_id');
  const user_email = localStorage.getItem('user_email');
  const classes = useStyles();
  const navigate = useNavigate()
  const formFields = JSON.parse(form.schema);

  useEffect(() => {
    if (form) {
      const filledResponses = formFields.reduce((acc, field) => {
        acc[field.label] = initialResponses ? initialResponses[field.label] : '';
        return acc;
      }, {});
      setResponses(filledResponses);
      if(initialResponses){
        setResponseLabel(initialResponses.responseLabel?initialResponses.responseLabel:'');
      }
    }
  }, [form, initialResponses]);

  const handleChange = (label, value) => {
    setResponses({
      ...responses,
      [label]: value,
    });
  };

  const handleSubmit = async () => {
    const emptyRequiredFields = formFields.filter(f=>(f.required && !responses[f.label])).map(f=>f.label);
    if (!responseLabel){
      alert('It is recommended to add a response label.')
    } else if(emptyRequiredFields.length>0){
      alert('Required fields:' + emptyRequiredFields.join(', '));
    } else {
      const response = {
        userId: user_id,
        userEmail: user_email,
        formId: form.id,
        formName: form.name,
        responseLabel: responseLabel,
        modifiedOn: serverTimestamp(),
        responses,
      };

      try {
        if (initialResponses) {
          await updateDoc(doc(responseCollection, initialResponses.id), response);
          alert('Response updated successfully');
        } else {
          await addDoc(responseCollection, response);
          alert('Response submitted successfully');
        }
      } catch (error) {
        console.log('Error submitting response: ', error);
      }

      navigate('/response-list')
    }
  };

  const renderField = (field) => {
    const fieldRequired = field.required?true:false;
    switch (field.type) {
      case 'text':
      case 'number':
      case 'email':
      case 'tel':
      case 'date':
        return (
          <TextField
            type={field.type}
            name={field.label}
            label={field.label}
            value={responses[field.label]}
            onChange={(e)=>handleChange(field.label, e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true, required: {fieldRequired}
            }}
          />
        );
      case 'textarea':
        return (
          <TextField
            name={field.label}
            label={field.label}
            value={responses[field.label]}
            onChange={(e)=>handleChange(field.label, e.target.value)}
            multiline
            rows={4}
            fullWidth
            InputLabelProps={{
              shrink: true, required: {fieldRequired}
            }}
          />
        );
      case 'checkbox':
        return (
          <FormControl component="fieldset" className={classes.formControl}>
            <Typography>
              {field.label}
              {fieldRequired && (<span>*</span>)}
            </Typography>
            {field.options.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    name={field.label}
                    value={option}
                    checked={responses[field.label]?.includes(option) || false}
                    onChange={(e)=>{
                      const values = responses[field.label] || [];
                      handleChange(field.label,
                        (e.target.checked) ? [ ...values, option ] : values.filter( value => value!=option )
                      );
                    }
                  }
                  />
                }
                label={option}
              />
            ))}
          </FormControl>
        );
      case 'radio':
        return (
          <FormControl component="fieldset" className={classes.formControl}>
            <Typography>
              {field.label}
              {fieldRequired && (<span>*</span>)}
            </Typography>
            <RadioGroup
              name={field.label}
              value={responses[field.label] || ""}
              onChange={(e)=>handleChange(field.label, e.target.value)}
            >
              {field.options.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case 'dropdown':
        return (
          <FormControl fullWidth margin="normal">
          <InputLabel shrink id={field.label}>
            {field.label}
            {fieldRequired && (<span>*</span>)}
          </InputLabel>
          <Select labelId={field.label}
            label={field.label}
            InputLabelProps={{
              shrink: true, required: true
            }}
            value={responses[field.label] || 'select an option from dropdown'}
            onChange={(e) => handleChange(field.label, e.target.value)}>
            {field.options.map((option) => (
              <MenuItem key={`${field.label}_${option}`} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        )
      default:
        return null;
    }
  };

  return (
    <Box>
      <h2><span>{form.name}</span></h2>
      <Typography>Add a name of this response</Typography>
      <TextField
          fullWidth
          label="Enter Response Label"
          value={responseLabel}
          onChange={(e) => setResponseLabel(e.target.value)}
          InputLabelProps={{
            required: true, shrink: true
          }}
          margin="normal"
          style={{marginBottom: "20px"}}
        />
      <Typography>Form Field Values</Typography>
      <Container>
      {formFields.map((field, index) => (
        <div key={index} className={classes.formControl}>
          {renderField(field)}
        </div>
      ))}
      <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2, ml: 2 }}>
          Save Form
      </Button>
      </Container>
    </Box>
  );
};

export default FormResponse;
