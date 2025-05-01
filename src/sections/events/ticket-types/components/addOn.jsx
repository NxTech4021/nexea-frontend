import useSWR from 'swr';
import React from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Stack,
  alpha,
  // Button,
  Button,
  Tooltip,
  // Tooltip,
  Typography,
  CircularProgress,
} from '@mui/material';

import { fetcher, endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';

import { useAddOnsStore } from '../hooks/use-add-on';

const AddOn = ({ addOn }) => {
  const { data, isLoading, mutate } = useSWR(endpoints.ticketType.addOn.root, fetcher);

  const { setSelectedAddOns } = useAddOnsStore();
  const selectedAddOns = useAddOnsStore((state) => state.selectedAddOns);
  const handleCreateClick = () => {
    console.log('Create button clicked');
    
    // New: Check if we're in edit mode (passed from parent)
    if (typeof addOn?.onTrue === 'function') {
      console.log('Calling onTrue()');
      addOn.onTrue();
    } else {
      // Fallback for create flow
      console.log('Using default creation handler');
      // Add your default creation logic here or emit an event
    }
  };
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress
          thickness={6}
          size={32}
          sx={{
            strokeLinecap: 'round',
            color: 'primary.main',
          }}
        />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          p: 3,
          textAlign: 'center',
        }}
      >
        <Iconify
          icon="ph:ticket-duotone"
          width={64}
          height={64}
          sx={{
            mb: 2,
            color: (theme) => alpha(theme.palette.primary.main, 0.4),
          }}
        />
        <Typography variant="h6" gutterBottom>
          No Add-ons Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          There are no add-ons available to select for this ticket
        </Typography>
      </Box>
    );
  }

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
      {data.map((item) => (
        <Tooltip key={item.id} title={`Add ${item.name}`}>
          <Button
            variant="outlined"
            sx={{
              minWidth: 200,
              height: 200,
              position: 'relative',
              overflow: 'hidden',
              '&:before': selectedAddOns?.some((a) => a.id === item.id) && {
                content: "''",
                position: 'absolute',
                width: 1,
                height: 1,
                bgcolor: alpha('#FFF', 0.05),
              },
            }}
            onClick={() => {
              setSelectedAddOns(item);
            }}
          >
            <Stack sx={{ opacity: selectedAddOns?.some((a) => a.id === item.id) && 0.15 }}>
              <Typography variant="subtitle1">{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Intl.NumberFormat('en-MY', {
                  minimumFractionDigits: 2,
                  style: 'currency',
                  currency: 'MYR',
                }).format(item.price)}
              </Typography>
              <Typography variant="body2" fontSize={11} color="text.secondary">
                {item.description}
              </Typography>
            </Stack>
            {selectedAddOns?.some((a) => a.id === item.id) && (
              <Box position="absolute">
                <Iconify icon="material-symbols:check-rounded" width={20} />
              </Box>
            )}
          </Button>
        </Tooltip>
      ))}
      <Tooltip title="Create new add on">
        <Button
          variant="outlined"
          sx={{
            minWidth: 200,
            height: 200,
            position: 'relative',
            overflow: 'hidden',
            '&:active': { // Add this to verify clicks
        backgroundColor: 'action.selected',
        transform: 'scale(0.98)'
      }
          }}
          onClick={handleCreateClick}
          // onClick={() => {
          //   // setSelectedAddOns(item);
          //   // addOn.onTrue();
          //   if (addOn?.onTrue) {
          //     addOn.onTrue();
          //   } else {
          //     console.warn('Add-on creation handler not available');
          //     // Optionally show a user-friendly message
          //   }
          // }}
        >
          <Box position="absolute">
            <Iconify icon="material-symbols:add-rounded" width={20} />
          </Box>
        </Button>
      </Tooltip>
    </Stack>
    //     <Box sx={{ pt: 1 }}>
    //       <Box sx={{ mb: 3 }}>
    //         <Typography variant="subtitle1" gutterBottom>
    //           Select Add-ons
    //         </Typography>
    //         <Typography variant="body2" color="text.secondary">
    //           Choose add-ons that will be available with this ticket type
    //         </Typography>
    //       </Box>

    //       <Divider sx={{ mb: 3 }} />

    //       <Box>
    //         <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
    //           {selectedAddOns?.length} add-on{selectedAddOns?.length !== 1 ? 's' : ''} selected
    //         </Typography>

    //         <Grid container spacing={2}>
    //           {data.map((item) => {
    //             const isSelected = selectedAddOns?.some((a) => a.id === item.id);

    //             return (
    //               <Grid item xs={12} sm={6} md={4} key={item.id}>
    //                 <Card
    //                   sx={{
    //                     p: 2,
    //                     height: '100%',
    //                     display: 'flex',
    //                     flexDirection: 'column',
    //                     borderRadius: 2,
    //                     cursor: 'pointer',
    //                     transition: 'all 0.2s ease-in-out',
    //                     position: 'relative',
    //                     ...(isSelected
    //                       ? {
    //                           borderColor: 'primary.main',
    //                           boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
    //                           bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.12),
    //                         }
    //                       : {
    //                           boxShadow: (theme) => theme.customShadows.z8,
    //                           '&:hover': {
    //                             borderColor: (theme) => alpha(theme.palette.primary.main, 0.48),
    //                             boxShadow: (theme) => `0 0 0 1px ${alpha(theme.palette.primary.main, 0.24)}`,
    //                             bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.08),
    //                           },
    //                         }),
    //                   }}
    //                   onClick={() => {
    //                     setSelectedAddOns(item);
    //                   }}
    //                 >
    //                   {isSelected && (
    //                     <Chip
    //                       icon={<Iconify icon="eva:checkmark-circle-fill" />}
    //                       label="Selected"
    //                       color="primary"
    //                       size="small"
    //                       sx={{
    //                         position: 'absolute',
    //                         top: 12,
    //                         right: 12,
    //                         fontSize: '0.75rem',
    //                       }}
    //                     />
    //                   )}

    //                   <Stack spacing={1}>
    //                     <Typography variant="subtitle1">{item.name}</Typography>

    //                     <Typography
    //                       variant="h6"
    //                       color="primary.main"
    //                       fontWeight={600}
    //                     >
    //                       {new Intl.NumberFormat('en-MY', {
    //                         minimumFractionDigits: 2,
    //                         style: 'currency',
    //                         currency: 'MYR',
    //                       }).format(item.price)}
    //                     </Typography>

    //                     {item.description && (
    //                       <Typography
    //                         variant="body2"
    //                         color="text.secondary"
    //                         sx={{
    //                           mt: 1,
    //                           flexGrow: 1,
    //                           overflow: 'hidden',
    //                           textOverflow: 'ellipsis',
    //                           display: '-webkit-box',
    //                           WebkitLineClamp: 3,
    //                           WebkitBoxOrient: 'vertical',
    //                         }}
    //                       >
    //                         {item.description}
    //                       </Typography>
    //                     )}
    //                   </Stack>
    //                 </Card>
    //               </Grid>
    //             );
    //           })}
    //         </Grid>
    //       </Box>
    //     </Box>
  );
};

export default AddOn;

AddOn.propTypes = {
  addOn: PropTypes.object,
};
