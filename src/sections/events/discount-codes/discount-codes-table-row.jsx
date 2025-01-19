import { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import CheckBox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { Stack, ListItemText } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';

import { types } from 'src/_mock/_discountCodes';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover from 'src/components/custom-popover/custom-popover';

import EditDiscountCode from './discount-codes-edit';

// ----------------------------------------------------------------------

export default function DiscountCodeTableRow({ row, selected, onSelectRow, onDeleteRow, onSave }) {
  const { codeName, codeType, codeValue, codeAvailability, codeLimit, endDate } = row;
  const { code, created_at, expirationDate, id, limit, ticketType, type, value } = row;

  const confirm = useBoolean();
  const popover = usePopover();

  const [selectedDiscountCode, setSelectedDiscountCode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  const handleEditClick = () => {
    setSelectedDiscountCode(row);
    setIsEditing(true);
    setEditedData({
      codeName: row.codeName,
      codeType: row.codeType,
      codeValue: row.codeValue,
      codeAvailability: row.codeAvailability,
      codeLimit: row.codeLimit,
      endDate: row.endDate,
    });
  };

  const handleSave = () => {
    console.log('Saved data:', editedData);
    onSave(editedData);
    setIsEditing(false);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <CheckBox checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{code}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {types.find((val) => val.id === type).name}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{value}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {ticketType.map((item) => (
              <Label key={item.id} color="success">{`${item.title} ( ${item.event.name} )`}</Label>
            ))}
          </Stack>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{limit || 'Unlimited'}</TableCell>
        <TableCell>
          <ListItemText
            primary={fDate(expirationDate)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>
        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            handleEditClick(row);
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
        {isEditing && (
          <EditDiscountCode
            discountCode={selectedDiscountCode}
            open={isEditing}
            onSave={handleSave}
            onClose={() => {
              setIsEditing(false);
              popover.onClose();
            }}
            setEditedData={setEditedData}
          />
        )}

        <Divider sx={{ borderStyle: 'dashed' }} />
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={`Are you sure want to delete ${codeName}?`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

DiscountCodeTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onSave: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
