import { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import CheckBox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { Box, Chip, Stack, alpha, Paper, Tooltip, Typography, ListItemText, ClickAwayListener } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';

import { types } from 'src/_mock/_discountCodes';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover from 'src/components/custom-popover/custom-popover';

import CreateDiscountCode from './modal/create-discount-codes';

// ----------------------------------------------------------------------

export default function DiscountCodeTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onSave,
  ticketTypes,
}) {
  const { code, created_at, expirationDate, id, limit, ticketType, type, value } = row;

  const confirm = useBoolean();
  const popover = usePopover();
  const [showFullList, setShowFullList] = useState(false);

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
    onSave(editedData);
    setIsEditing(false);
  };

  const renderAvailability = () => {
    if (!ticketType || ticketType.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No availability
        </Typography>
      );
    }

    // Group tickets by event
    const groupedByEvent = ticketType.reduce((acc, ticket) => {
      const eventName = ticket.event.name;
      if (!acc[eventName]) {
        acc[eventName] = [];
      }
      acc[eventName].push(ticket);
      return acc;
    }, {});

    const eventEntries = Object.entries(groupedByEvent);
    const totalEvents = eventEntries.length;
    const displayEvents = eventEntries.slice(0, 2); // Limit to 2 events
    const remainingEvents = totalEvents - 2;

    const hasMoreEvents = remainingEvents > 0;

    const renderEventTooltip = (eventName, tickets) => (
      <Paper
        sx={{
          p: 2,
          minWidth: 300,
          maxWidth: 350,
          boxShadow: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {eventName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
            {tickets.length} ticket types available
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {tickets.map((ticket) => (
              <Chip
                key={ticket.id}
                label={ticket.title}
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  backgroundColor: 'background.paper',
                  mb: 0.5,
                  '& .MuiChip-label': {
                    px: 0.75,
                    fontWeight: 500
                  }
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>
    );

    const renderFullListTooltip = () => (
      <Paper
        sx={{
          p: 2.5,
          minWidth: 450,
          maxWidth: 500,
          boxShadow: 4,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
            All Available Ticket Types
          </Typography>
          {eventEntries.map(([eventName, tickets]) => (
            <Box key={eventName}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 1,
                  pb: 0.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {eventName} ({tickets.length} types)
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ pl: 1 }}>
                {tickets.map((ticket) => (
                  <Chip
                    key={ticket.id}
                    label={ticket.title}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      borderColor: 'divider',
                      color: 'text.secondary',
                      backgroundColor: 'background.paper',
                      mb: 0.5,
                      '& .MuiChip-label': {
                        px: 0.75,
                        fontWeight: 500
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>
    );

    return (
      <Box sx={{ maxWidth: 350, position: 'relative' }}>
        <Stack spacing={1}>
          {displayEvents.map(([eventName, tickets]) => (
            <Box 
              key={eventName}
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) => theme.palette.background.neutral,
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                  mb: 0.75,
                  fontSize: '0.8rem',
                }}
              >
                {eventName}
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center">
                {tickets.slice(0, 3).map((ticket) => (
                  <Chip
                    key={ticket.id}
                    label={ticket.title}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      borderColor: 'divider',
                      color: 'text.secondary',
                      backgroundColor: 'background.paper',
                      mb: 0.5,
                      '& .MuiChip-label': {
                        px: 0.75,
                        fontWeight: 500
                      }
                    }}
                  />
                ))}
                {tickets.length > 3 && (
                  <ClickAwayListener onClickAway={() => setShowFullList(false)}>
                    <Box sx={{ position: 'relative' }}>
                      <Tooltip
                        open={showFullList === eventName}
                        title={renderEventTooltip(eventName, tickets)}
                        placement="right"
                        arrow
                        PopperProps={{
                          sx: {
                            '& .MuiTooltip-tooltip': {
                              p: 0,
                              backgroundColor: 'transparent',
                              maxWidth: 'none',
                            },
                            '& .MuiTooltip-arrow': {
                              color: 'background.paper',
                            }
                          }
                        }}
                      >
                        <Chip
                          label={`+${tickets.length - 3} more`}
                          size="small"
                          variant="outlined"
                          clickable
                          onClick={() => setShowFullList(showFullList === eventName ? false : eventName)}
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                            cursor: 'pointer',
                            mb: 0.5,
                            '&:hover': {
                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                              borderColor: 'primary.dark',
                            },
                            '& .MuiChip-label': {
                              px: 0.75,
                              fontWeight: 500
                            }
                          }}
                        />
                      </Tooltip>
                    </Box>
                  </ClickAwayListener>
                )}
              </Stack>
            </Box>
          ))}
          
          {hasMoreEvents && (
            <ClickAwayListener onClickAway={() => setShowFullList(false)}>
              <Box sx={{ position: 'relative' }}>
                <Tooltip
                  open={showFullList === 'all'}
                  title={renderFullListTooltip()}
                  placement="right-start"
                  arrow
                  PopperProps={{
                    sx: {
                      '& .MuiTooltip-tooltip': {
                        p: 0,
                        backgroundColor: 'transparent',
                        maxWidth: 'none',
                      },
                      '& .MuiTooltip-arrow': {
                        color: 'background.paper',
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      border: '1px dashed',
                      borderColor: 'primary.main',
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                      cursor: 'pointer',
                      textAlign: 'center',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        borderColor: 'primary.dark',
                      },
                    }}
                    onClick={() => setShowFullList(showFullList === 'all' ? false : 'all')}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'primary.main',
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    >
                      +{remainingEvents} more event{remainingEvents > 1 ? 's' : ''}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        display: 'block',
                        fontSize: '0.65rem'
                      }}
                    >
                      Click to view all
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </ClickAwayListener>
          )}
        </Stack>
      </Box>
    );
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
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {type === 'percentage'
            ? `${value.toFixed(2)} %`
            : new Intl.NumberFormat('en-MY', {
                minimumFractionDigits: 2,
                style: 'currency',
                currency: 'MYR',
              }).format(value)}
        </TableCell>
        <TableCell sx={{ py: 2 }}>
          {renderAvailability()}
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
          <CreateDiscountCode
            discountCode={selectedDiscountCode}
            open={isEditing}
            onSave={handleSave}
            onClose={() => {
              setIsEditing(false);
              popover.onClose();
            }}
            setEditedData={setEditedData}
            ticketTypes={ticketTypes}
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
        content={`Are you sure want to delete ${code}?`}
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
  ticketTypes: PropTypes.array,
};
