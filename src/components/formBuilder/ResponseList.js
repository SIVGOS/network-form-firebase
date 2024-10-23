// ResponseList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button
} from '@mui/material';
import { getDocs, query, where, orderBy, deleteDoc, getDoc, doc } from 'firebase/firestore';
import { formCollection, responseCollection } from '../../firebase';

const FormResponseList = () => {
  const user_id = localStorage.getItem('user_id');
  const [formResponses, setFormResponses] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchResponses();
  }, []);
  
  const fetchResponses = () => {
    console.log('Fetching responses...')
    const filteredCollection = query(
        responseCollection,
        where('userId', '==', user_id),
        orderBy('modifiedOn', 'desc')
      );
    getDocs(filteredCollection).
        then((responses) => {
            console.log(responses);
            const responseList = [];
            if(typeof(responses)!='undefined'){
                responses.forEach((doc)=>{
                  responseList.push({...doc.data(), id:doc.id})
              });
            }
            setFormResponses(responseList);
        }
        ).catch((error)=>{
            console.log(error)
        }
        )
  };

  const handleEditResponse = async (resp) => {
    try {
      const formDoc = await getDoc(doc(formCollection, resp.formId));
      const form = { id: formDoc.id, ...formDoc.data() };
      navigate('/form-response', { state: { form, responses: resp.responses } });
    } catch (error) {
      console.error("Error fetching form: ", error);
    }
  }

  const handleDeleteResponse = async (respId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this response? This action cannot be undone.");
    if(isConfirmed){
      try{
        await deleteDoc(responseCollection, respId);
        setFormResponses(formResponses.filter((resp)=>resp.id !== respId));
      }catch (error){
        console.log('Error in deleting response:', error);
      }
    }
    else{
      console.log("Response deletion canceled.");
    }
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" component="div" gutterBottom style={{ padding: '16px' }}>
        Form Responses
      </Typography>
      <Table aria-label="form response table">
        <TableHead>
          <TableRow>
            <TableCell>Form Name</TableCell>
            <TableCell>Filled By</TableCell>
            <TableCell>Filled On</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formResponses.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.formName}</TableCell>
              <TableCell>{row.userEmail}</TableCell>
              <TableCell>{new Date(row.modifiedOn.toDate()).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditResponse(row)}
                    style={{ marginRight: '10px' }}
                  >
                    Edit Response
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteResponse(row.id)}
                    style={{ marginRight: '10px' }}
                  >
                  Delete Response
                  </Button>
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FormResponseList;
