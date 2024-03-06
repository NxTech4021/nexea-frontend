import React from 'react';
import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import {
  Table,
  Button,
  Divider,
  TableRow,
  MenuItem,
  TableBody,
  TableHead,
  TableCell,
  IconButton,
  TableContainer,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import CustomPopover from 'src/components/custom-popover/custom-popover';

const EventListsDashboard = () => {
  const popover = usePopover();

  return (
    <>
      <Card>
        <CardHeader title="Events" subheader="List of events in Nexea" />
        <Box sx={{ mt: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>PIC</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Startup Event</TableCell>
                  <TableCell>Jan 20, 2023</TableCell>
                  <TableCell>Sara</TableCell>
                  <TableCell>Done</TableCell>
                  <TableCell>
                    <IconButton onClick={popover.onOpen}>
                      <Icon
                        icon="pepicons-pop:dots-y"
                        width={20}
                        color={popover.open ? 'inherit' : 'default'}
                      />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <Box sx={{ textAlign: 'end', px: 4, p: 3 }}>
          <Button>View All</Button>
        </Box>
      </Card>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem>
          <Iconify icon="eva:cloud-download-fill" />
          Download
        </MenuItem>

        <MenuItem>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem>
          <Iconify icon="solar:share-bold" />
          Share
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </>
  );
};

export default EventListsDashboard;
