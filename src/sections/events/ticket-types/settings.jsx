import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import axiosInstance from 'src/utils/axios';
import { enqueueSnackbar } from 'notistack';

export default function TicketSettings() {
  const [typeName, setTypeName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchTypes();
    fetchCategories();
  }, []);

  const fetchTypes = async () => {
    try {
      const { data } = await axiosInstance.get('/api/custom-ticket-types');
      setTypes(data);
    } catch (error) {
      console.error('Error fetching ticket types:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/api/ticket-categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching ticket categories:', error);
    }
  };

  const handleAddType = async () => {
    try {
      await axiosInstance.post('/api/custom-ticket-types', { name: typeName });
      enqueueSnackbar('Ticket type added successfully', { variant: 'success' });
      setTypeName('');
      fetchTypes();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Failed to add type', { variant: 'error' });
    }
  };

  const handleAddCategory = async () => {
    try {
      await axiosInstance.post('/api/ticket-categories', { name: categoryName });
      enqueueSnackbar('Ticket category added successfully', { variant: 'success' });
      setCategoryName('');
      fetchCategories();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Failed to add category', {
        variant: 'error',
      });
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <CustomBreadcrumbs
          heading="Ticket Types Management"
          links={[
            { name: 'Settings', href: paths.dashboard.root },
            { name: 'Ticket Types' },
            { name: 'List' },
          ]}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="New Ticket Type"
          value={typeName}
          onChange={(e) => setTypeName(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddType}>
          Add Type
        </Button>

        <TextField
          label="New Ticket Category"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddCategory}>
          Add Category
        </Button>
      </Box>

      {/* Table for Ticket Types and Categories 
      <Box mt={4}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type / Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>
                    <Button color="primary">Edit</Button>
                    <Button color="error">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <Button color="primary">Edit</Button>
                    <Button color="error">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>*/}
    </Container>
  );
}
