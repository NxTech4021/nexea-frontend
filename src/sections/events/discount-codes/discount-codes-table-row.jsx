import { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { ListItemText } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate, fTime } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover from 'src/components/custom-popover/custom-popover';

import EditDiscountCode from './discount-codes-edit';

// ----------------------------------------------------------------------

export default function DiscountCodeTableRow({ row, selected, onDeleteRow, onSave }) {
  const { codeName, codeType, codeValue, codeAvailability, codeCategory, codeLimit, endDate } = row;

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
      codeCategory: row.codeCategory,
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

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{codeName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{codeType}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{codeValue}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {codeAvailability.map((availability, index) => (
            <div key={index}>{availability}</div>
          ))}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{codeCategory}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{codeLimit}</TableCell>
        <TableCell>
          <ListItemText
            primary={fDate(endDate)}
            secondary={fTime(endDate)}
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
  onSave: PropTypes.func,  
  row: PropTypes.object,
  selected: PropTypes.bool,
};
