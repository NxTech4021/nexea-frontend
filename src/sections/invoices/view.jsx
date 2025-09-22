import { toast } from 'sonner';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Stack, Container, TextField, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { axiosInstance } from 'src/utils/axios';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

const Invoices = () => {
  console.log('asd');
  const isLoading = useBoolean();
  const [customers, setCustomers] = useState(null);
  const [customerName, setCustomerName] = useState(null);

  const getCustomer = async () => {
    try {
      isLoading.onTrue();
      const data = await axiosInstance.get(
        `/api/qbo/customers${customerName ? `?name=${customerName}` : ''}`
      );
      setCustomers(data);
    } catch (error) {
      toast.error(error);
      console.log(error);
    } finally {
      isLoading.onFalse();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 3 }}>
      <CustomBreadcrumbs
        heading="Invoices"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Invoices' },
          { name: 'List' },
        ]}
      />

      <Stack mt={4} direction="row" alignItems="center" spacing={2}>
        <Typography>Customers</Typography>
        <TextField
          size="small"
          placeholder="Search by name"
          onChange={(e) => setCustomerName(e.target.value)}
          value={customerName}
        />
        <LoadingButton variant="outlined" onClick={getCustomer} loading={isLoading.value}>
          Get Customers
        </LoadingButton>
      </Stack>
      <Stack>
        {customers &&
          (customers?.data?.length ? (
            customers?.data?.map((customer) => <Typography>{customer?.Id || 'None'}</Typography>)
          ) : (
            <Typography>Not found</Typography>
          ))}
      </Stack>
    </Container>
  );
};

export default Invoices;
