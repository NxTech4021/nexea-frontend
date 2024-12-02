import React from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';

import { Box, Stack, Button, Typography, ListItemText } from '@mui/material';

import Iconify from 'src/components/iconify';

const EventAttendees = ({ watchData, resetData, setData }) => {
  const file = watchData('attendeesData');

  const onDrop = (e) => {
    setData('attendeesData', e[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Box mt={2}>
      <Typography variant="h6">Upload Attendees Data</Typography>
      <Box mt={2} gap={2} {...getRootProps()}>
        <Box
          sx={{
            border: 2,
            p: 2,
            borderRadius: 2,
            borderColor: !file ? 'text.secondary' : 'success.main',
            borderStyle: 'dashed',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              borderColor: 'text.primary',
              transition: 'all ease-in-out .1s',
            },
            ...(isDragActive && {
              bgcolor: (theme) => theme.palette.background.paper,
            }),
          }}
        >
          <Iconify icon="humbleicons:upload" width={30} color="text.secondary" />
          <Stack direction="row" spacing={2} alignItems="center">
            {/* <RHFUploadBox name="attendeesData" onDrop={onDrop} /> */}

            <ListItemText
              primary="Upload CSV File"
              secondary={file?.name || 'Select or drag a file'}
            />
            {/* {file && (
              <IconButton
                color="error"
                onClick={() => setData('attendeesData', null)}
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                }}
              >
                <Iconify icon="material-symbols:delete" />
              </IconButton>
            )} */}
          </Stack>
        </Box>
        <input {...getInputProps()} />
      </Box>
      {file && (
        <Button
          onClick={() => setData('attendeesData', null)}
          size="small"
          variant="contained"
          color="error"
          startIcon={<Iconify icon="material-symbols:delete" />}
          sx={{
            mt: 1,
          }}
        >
          Remove
        </Button>
        // <IconButton color="error" onClick={() => setData('attendeesData', null)}>
        //   <Iconify icon="material-symbols:delete" />
        // </IconButton>
      )}
    </Box>
  );
};

export default EventAttendees;

EventAttendees.propTypes = {
  watchData: PropTypes.func,
  resetData: PropTypes.func,
  setData: PropTypes.func,
};
