import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, TextField, TableSortLabel, TablePagination, Menu, MenuItem } from '@mui/material';
import { getDocs, query, where, orderBy, deleteDoc, addDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { formCollection, responseCollection } from '../../firebase';

const FormResponseList = () => {
  const user_id = localStorage.getItem('user_id');
  const [formResponses, setFormResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderByColumn, setOrderByColumn] = useState('formName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
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
    getDocs(filteredCollection)
      .then((responses) => {
        const responseList = [];
        if (typeof responses !== 'undefined') {
          responses.forEach((doc) => {
            responseList.push({ ...doc.data(), id: doc.id });
          });
        }
        setFormResponses(responseList);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleEditResponse = async (resp) => {
    try {
      const formDoc = await getDoc(doc(formCollection, resp.formId));
      const form = { id: formDoc.id, ...formDoc.data() };
      navigate('/form-response', { state: { form, responses: { ...resp.responses, id: resp.id, responseLabel: resp.responseLabel } } });
    } catch (error) {
      console.error("Error fetching form: ", error);
    }
  };

  const handleDeleteResponse = async (respId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this response? This action cannot be undone.");
    if (isConfirmed) {
      try {
        await deleteDoc(doc(responseCollection, respId));
        setFormResponses(formResponses.filter((resp) => resp.id !== respId));
      } catch (error) {
        console.log('Error in deleting response:', error);
      }
    } else {
      console.log("Response deletion canceled.");
    }
  };

  const handleCopyResponse = async (resp) => {
    const response = {
      userId: user_id,
      userEmail: resp.userEmail,
      formId: resp.formId,
      formName: resp.formName,
      responseLabel: `Copy of ${resp.responseLabel}`,
      modifiedOn: serverTimestamp(),
      responses: resp.responses,
    };
    await addDoc(responseCollection, response);
    fetchResponses();
  }

  const handleDownload = async (resp) => {
    const formDoc = await getDoc(doc(formCollection, resp.formId));
    const formSchema = formDoc.data().schema;
    const downloadData = {
      formName: resp.formName,
      responseLabel: resp.responseLabel,
      userEmail: resp.userEmail,
      fields: formSchema.map(field => ({ ...field, value: resp.responses[field.label] || null }))
    };
    const data = new Blob([JSON.stringify(downloadData, null, 4)], { type: 'text/plain' });
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resp.responseLabel}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortRequest = (property) => {
    const isAsc = orderByColumn === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderByColumn(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedResponses = formResponses.sort((a, b) => {
    if (a[orderByColumn] < b[orderByColumn]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[orderByColumn] > b[orderByColumn]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredResponses = sortedResponses.filter((response) =>
    (response.formName.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (response.responseLabel.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (response.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedResponses = filteredResponses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleMenuOpen = (event, response) => {
    setAnchorEl(event.currentTarget);
    setSelectedResponse(response);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedResponse(null);
  };

  return (
    <Paper>
      <Typography variant="h6" component="div" gutterBottom style={{ padding: '16px' }}>
        Form Responses
      </Typography>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <TableContainer>
        <Table aria-label="form response table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderByColumn === 'formName'}
                  direction={orderByColumn === 'formName' ? order : 'asc'}
                  onClick={() => handleSortRequest('formName')}
                >
                  Form Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderByColumn === 'responseLabel'}
                  direction={orderByColumn === 'responseLabel' ? order : 'asc'}
                  onClick={() => handleSortRequest('responseLabel')}
                >
                  Response Label
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderByColumn === 'userEmail'}
                  direction={orderByColumn === 'userEmail' ? order : 'asc'}
                  onClick={() => handleSortRequest('userEmail')}
                >
                  Filled By
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderByColumn === 'modifiedOn'}
                  direction={orderByColumn === 'modifiedOn' ? order : 'asc'}
                  onClick={() => handleSortRequest('modifiedOn')}
                >
                  Filled On
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResponses.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.formName}</TableCell>
                <TableCell>{row.responseLabel || 'Unnamed response'}</TableCell>
                <TableCell>{row.userEmail}</TableCell>
                <TableCell>{new Date(row.modifiedOn.toDate()).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    aria-controls="action-menu"
                    aria-haspopup="true"
                    onClick={(event) => handleMenuOpen(event, row)}
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
                    <MenuItem onClick={() => { handleEditResponse(selectedResponse); handleMenuClose(); }}>Edit</MenuItem>
                    <MenuItem onClick={() => { handleDeleteResponse(selectedResponse.id); handleMenuClose(); }}>Delete</MenuItem>
                    <MenuItem onClick={() => { handleCopyResponse(selectedResponse); handleMenuClose(); }}>Copy</MenuItem>
                    <MenuItem onClick={() => { handleDownload(selectedResponse); handleMenuClose(); }}>Download</MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredResponses.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default FormResponseList;
