import useSWR from 'swr';
import React from 'react';

import { Box, Fab, Button, Container } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fetcher, endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import TableView from './table/table-view';
import CreateDialog from './dialog/createDialog';

const BulkDiscountPage = () => {
  const isSmallScreen = useResponsive('down', 'sm');

  const open = useBoolean();

  const { data: res, isLoading, mutate } = useSWR(endpoints.bulkDiscount.get, fetcher);
  const { data, isEventLoading } = useSWR(endpoints.events.list, fetcher);
  const { data: tickets, isTicketLoading } = useSWR(endpoints.ticketType.get, fetcher);

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'left', sm: 'center' },
          mb: { xs: 3, md: 5 },
          gap: 1,
        }}
      >
        <CustomBreadcrumbs
          heading="Bulk Discount"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Bulk Discount' },
            { name: 'List' },
          ]}
        />

        {!isSmallScreen ? (
          <Button
            // onClick={handleCreateTicketType}
            variant="contained"
            size="small"
            sx={{
              minWidth: 'fit-content',
              // height: 40,
              fontWeight: 550,
              borderRadius: 0.5,
            }}
            startIcon={<Iconify icon="mingcute:add-line" width={18} />}
            onClick={open.onTrue}
          >
            Bulk Discount
          </Button>
        ) : (
          <Fab
            aria-label="create"
            sx={{
              color: 'white',
              backgroundColor: 'black',
              position: 'absolute',
              bottom: 30,
              right: 30,
            }}
            onClick={open.onTrue}
          >
            <Iconify icon="mingcute:add-line" width={18} />
          </Fab>
        )}
      </Box>

      <TableView data={res?.data} isLoading={isLoading} />

      <CreateDialog
        open={open.value}
        close={() => open.onFalse()}
        data={data?.events || []}
        tickets={tickets?.ticketTypes || []}
      />
    </Container>
  );
};

export default BulkDiscountPage;
