import React, { useState } from 'react';

import TableSortLabel from '@mui/material/TableSortLabel';
import {
  Chip,
  Table,
  Paper,
  Stack,
  Divider,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  Pagination,
  TableContainer,
} from '@mui/material';

import employee from 'src/_mock/startupsDatabase.users.json';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

const EmployeeLists = () => {
  //   const [checkAll, setCheckAll] = useState(false);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  const handleChange = (event, value) => {
    setPage(value);
  };
  const data = employee;
  //   const [check, setCheck] = useState(false);

  const onSelectRow = (i) => {
    const newSelected = selected.includes(i)
      ? selected.filter((value) => value !== i)
      : [...selected, i];

    setSelected(newSelected);
  };

  const onSelectAllRow = () => {
    const index = data;
    const t = [];
    if (selected.length === data.length) {
      setSelected([]);
    } else {
      index.forEach((element) => {
        t.push(element.email);
      });
      setSelected(t);
    }
  };

  const head = (
    <TableHead>
      <TableRow>
        <TableCell>
          {selected.length > 0 ? (
            <Checkbox
              icon={<Iconify icon="carbon:checkbox-indeterminate-filled" />}
              sx={{
                color: 'success.main',
                bgcolor: 'success.main',
              }}
              onClick={onSelectAllRow}
            />
          ) : (
            <Checkbox onClick={onSelectAllRow} checked={selected.length === data.length} />
          )}
        </TableCell>
        <TableCell>
          <TableSortLabel>Name</TableSortLabel>
        </TableCell>
        <TableCell>Email</TableCell>
        <TableCell>
          <TableSortLabel>Position</TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>Verified</TableSortLabel>
        </TableCell>
      </TableRow>
    </TableHead>
  );

  const body = data.slice(6 * page - 6, 6 * page).map((item, i) => (
    <TableBody>
      <TableRow key={i}>
        <TableCell>
          <Checkbox
            id={i}
            onClick={() => onSelectRow(item.email)}
            checked={selected.includes(item.email)}
          />
        </TableCell>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell>{item.position}</TableCell>
        <TableCell>
          {item.isVerified ? (
            <Chip label="Verified" variant="outlined" color="primary" />
          ) : (
            <Chip label="Unverified" variant="outlined" color="error" />
          )}
        </TableCell>
      </TableRow>
    </TableBody>
  ));

  return (
    <Stack>
      <TableContainer component={Paper} sx={{ position: 'relative' }}>
        {selected.length > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              pl: 2,
              pr: 2,
              top: 0,
              left: 0,
              width: 1,
              zIndex: 9,
              height: 70,
              position: 'absolute',
              bgcolor: 'primary.lighter',
              color: 'success.dark',
            }}
            gap={3}
          >
            <Checkbox
              icon={<Iconify icon="carbon:checkbox-indeterminate-filled" />}
              sx={{
                color: 'success.main',
              }}
              onClick={onSelectAllRow}
              checked={selected.length === data.length}
            />
            <Typography fontWeight={500}>{selected.length} selected</Typography>
            <IconButton sx={{ ml: 'auto', color: (theme) => theme.palette.success.dark }}>
              <Iconify icon="ic:outline-delete" width={24} />
            </IconButton>
          </Stack>
        )}
        <Scrollbar>
          <Table size="medium">
            {head}
            {body}
          </Table>
        </Scrollbar>
      </TableContainer>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <Pagination
        size="small"
        count={Math.floor(data.length / 5)}
        sx={{ p: 3, display: 'flex', justifyContent: { xs: 'center', lg: 'end' } }}
        onChange={handleChange}
      />
    </Stack>
  );
};

export default EmployeeLists;
