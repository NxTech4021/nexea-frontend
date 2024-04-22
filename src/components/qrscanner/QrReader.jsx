import QrScanner from 'qr-scanner';
import { useRef, useState, useEffect } from 'react';

import { Box, Modal, Button, Container, Typography } from '@mui/material';

const QrReader = () => {
  const scanner = useRef(null);
  const videoRef = useRef(null);
  const qrBoxRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [scannedResult, setScannedResult] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const onScanSuccess = (result) => {
    console.log(result);
    setScannedResult(result?.data);
    setOpenModal(true);
  };

  const onScanFail = (err) => {
    console.log(err);
  };

  useEffect(() => {
    if (videoRef?.current && !scanner.current) {
      scanner.current = new QrScanner(videoRef?.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxRef?.current || undefined,
      });

      scanner?.current
        ?.start()
        .then(() => setCameraOn(true))
        .catch((err) => {
          if (err) setCameraOn(false);
        });
    }

    return () => {
      if (scanner?.current) {
        scanner.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraOn) {
      alert(
        'Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload.'
      );
    }
  }, [cameraOn]);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#cfe8fc',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            maxWidth: '60%',
            maxHeight: '100%',
            marginBottom: '20px',
          }}
        >
          {/* eslint-disable jsx-a11y/media-has-caption */}
          <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto' }}>
            {' '}
          </video>
        </Box>

        <div ref={qrBoxRef} />
      </Box>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: '#f0f0f0',
            boxShadow: 24,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography id="modal-title" variant="h6" component="h6">
            Scanned Output
          </Typography>
          <Box
            sx={{
              width: '100%',
              padding: '20px',
              backgroundColor: 'background.paper',
              borderRadius: '10px',
              margintTop: '10px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <Typography id="modal-description" sx={{ mt: 2 }}>
              {scannedResult}
            </Typography>
          </Box>
          <Button size="medium" variant="contained" color="primary" fullWidth disabled>
            Verify
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default QrReader;
