import useSWR from 'swr';
import React, { useState } from 'react';

import { Box, Stack, alpha, Button, Tooltip, Typography, CircularProgress } from '@mui/material';

import { fetcher, endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';

import { useAddOnsStore } from '../hooks/use-add-on';

const AddOn = () => {
  const { data, isLoading } = useSWR(endpoints.ticketType.addOn.root, fetcher);
  const [selected, setSelected] = useState([]);
  const { setSelectedAddOns } = useAddOnsStore();
  const selectedAddOns = useAddOnsStore((state) => state.selectedAddOns);

  console.log(selectedAddOns);

  if (isLoading) {
    return (
      <Box
        sx={{
          position: 'relative',
          top: 200,
          textAlign: 'center',
        }}
      >
        <CircularProgress
          thickness={7}
          size={25}
          sx={{
            strokeLinecap: 'round',
          }}
        />
      </Box>
    );
  }

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      {data.map((item) => (
        <Tooltip key={item.id} title={`Add ${item.name}`}>
          <Button
            variant="outlined"
            sx={{
              minWidth: 200,
              height: 200,
              position: 'relative',
              overflow: 'hidden',
              '&:before': selectedAddOns?.some((a) => a.name === item.name) && {
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
            <Stack sx={{ opacity: selectedAddOns?.some((a) => a.name === item.name) && 0.15 }}>
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
            {selectedAddOns?.some((a) => a.name === item.name) && (
              <Box position="absolute">
                <Iconify icon="material-symbols:check-rounded" width={20} />
              </Box>
            )}
          </Button>
        </Tooltip>
      ))}
    </Stack>
  );
};

export default AddOn;
