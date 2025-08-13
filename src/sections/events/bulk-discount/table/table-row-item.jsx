import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Stack, Switch, TableRow, TableCell } from '@mui/material';

import Label from 'src/components/label';

const TableRowItem = ({ row, onChangeStatus }) => {
  const { event, tickets, minTotalQuantity, discountAmount, isActive: status, id } = row;
  const [isActive, setIsActive] = useState(status);

  return (
    <TableRow>
      <TableCell>{event?.name || 'N/A'}</TableCell>
      <TableCell>
        <Stack spacing={1}>
          {tickets?.map(({ ticketType }) => <Label>{ticketType.title}</Label>) || 'N/A'}
        </Stack>
      </TableCell>
      <TableCell>{minTotalQuantity || 'N/A'}</TableCell>
      <TableCell>{`${discountAmount}%` || 'N/A'}</TableCell>
      <TableCell>
        <Switch
          checked={isActive}
          onChange={() => {
            setIsActive(!isActive);
            onChangeStatus(id, !isActive);
          }}
        />
      </TableCell>
    </TableRow>
  );
};

export default TableRowItem;

TableRowItem.propTypes = {
  row: PropTypes.object,
  onChangeStatus: PropTypes.func,
};
