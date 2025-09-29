import { toast } from 'sonner';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Container, TextField, Typography, Button } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { axiosInstance } from 'src/utils/axios';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

const Invoices = () => {
  const isLoading = useBoolean();

  const [customers, setCustomers] = useState(null);
  const [services, setServices] = useState(null);
  const [accounts, setAccounts] = useState(null);

  const [customerName, setCustomerName] = useState(null);
  const [serviceName, setServiceName] = useState(null);
  const [accountName, setAccountName] = useState(null);

  const [invoiceInfo, setInvoiceInfo] = useState({
    customerRef: null,
    amount: 0,
    description: '',
    quantity: 1,
    discountAmount: null,
  });

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

  const getProductsOrServices = async () => {
    try {
      const data = await axiosInstance.get(
        `/api/qbo/services${serviceName ? `?name=${serviceName}` : ''}`
      );
      setServices(data);
    } catch (error) {
      toast.error(error);
      console.log(error);
    }
  };

  const getAccounts = async () => {
    try {
      const data = await axiosInstance.get(
        `/api/qbo/accounts${accountName ? `?name=${accountName}` : ''}`
      );

      setAccounts(data);
    } catch (error) {
      toast.error(error?.message);
    }
  };

  const createNewCustomer = async () => {
    if (!customerName) toast.warning('Customer name is required');
    else
      try {
        const res = await axiosInstance.post('/api/qbo/customer', { name: customerName });

        toast.success('Succssfully created');
      } catch (error) {
        toast.error(error?.message);
        console.log(error);
      }
  };

  const createNewService = async () => {
    if (!serviceName) toast.warning('Service name is required');
    else
      try {
        const res = await axiosInstance.post('/api/qbo/service', { name: serviceName });

        toast.success('Succssfully created');
      } catch (error) {
        toast.error(error?.message);
        console.log(error);
      }
  };

  const createInvoice = async () => {
    try {
      const data = await axiosInstance.post('/api/qbo/invoice', invoiceInfo);
      console.log(data);
    } catch (error) {
      console.log(error);
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

      <Box display="grid" gridTemplateColumns="repeat(2,1fr)">
        <Box>
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
                customers?.data?.map((customer) => (
                  <Typography>{customer?.Id || 'None'}</Typography>
                ))
              ) : (
                <Typography>Not found</Typography>
              ))}
          </Stack>
        </Box>
        <Box>
          <Stack mt={4} direction="row" alignItems="center" spacing={2}>
            <Typography>Services</Typography>
            <TextField
              size="small"
              placeholder="Search by service name"
              onChange={(e) => setServiceName(e.target.value)}
              value={serviceName}
            />
            <LoadingButton variant="outlined" onClick={getProductsOrServices}>
              Get Services
            </LoadingButton>
          </Stack>
          <Stack>
            {services &&
              (services?.data?.length ? (
                services?.data?.map((service) => <Typography>{service?.Name || 'None'}</Typography>)
              ) : (
                <Typography>Not found</Typography>
              ))}
          </Stack>
        </Box>
        <Box>
          <Stack mt={4} direction="row" alignItems="center" spacing={2}>
            <Typography>Accounts</Typography>
            <TextField
              size="small"
              placeholder="Search by service name"
              onChange={(e) => setAccountName(e.target.value)}
              value={accountName}
            />
            <LoadingButton variant="outlined" onClick={getAccounts}>
              Get Accounts
            </LoadingButton>
          </Stack>
          <Stack>
            {accounts &&
              (accounts?.data?.length ? (
                accounts?.data?.map((account) => <Typography>{account?.Id || 'None'}</Typography>)
              ) : (
                <Typography>Not found</Typography>
              ))}
          </Stack>
        </Box>
        <Box>
          <Stack mt={4} direction="row" alignItems="center" spacing={2}>
            <Typography>Create Customer</Typography>
            <TextField
              size="small"
              placeholder="Name"
              onChange={(e) => setCustomerName(e.target.value)}
              value={customerName}
            />
            <LoadingButton variant="outlined" onClick={createNewCustomer}>
              Create
            </LoadingButton>
          </Stack>
        </Box>
        <Box>
          <Stack mt={4} direction="row" alignItems="center" spacing={2}>
            <Typography>Create Service</Typography>
            <TextField
              size="small"
              placeholder="Name"
              onChange={(e) => setServiceName(e.target.value)}
              value={serviceName}
            />
            <LoadingButton variant="outlined" onClick={createNewService}>
              Create
            </LoadingButton>
          </Stack>
        </Box>
      </Box>
      <Stack mt={2} gap={2} display="inline-flex">
        <TextField
          size="small"
          placeholder="CustomerRef"
          onChange={(e) => setInvoiceInfo((prev) => ({ ...prev, customerRef: e.target.value }))}
          value={invoiceInfo.customerRef}
        />
        <TextField
          size="small"
          placeholder="Amount"
          onChange={(e) => setInvoiceInfo((prev) => ({ ...prev, amount: e.target.value }))}
          value={invoiceInfo.amount}
        />
        <TextField
          size="small"
          placeholder="Quantity"
          onChange={(e) => setInvoiceInfo((prev) => ({ ...prev, quantity: e.target.value }))}
          value={invoiceInfo.quantity}
        />
        <TextField
          size="small"
          placeholder="Description"
          onChange={(e) => setInvoiceInfo((prev) => ({ ...prev, description: e.target.value }))}
          value={invoiceInfo.description}
        />
        <TextField
          size="small"
          placeholder="Discount Amount"
          onChange={(e) => setInvoiceInfo((prev) => ({ ...prev, discountAmount: e.target.value }))}
          value={invoiceInfo.discountAmount}
        />
        <Button variant="outlined" onClick={createInvoice}>
          Create invoice
        </Button>
      </Stack>
    </Container>
  );
};

export default Invoices;
