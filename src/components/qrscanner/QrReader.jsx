import QrScanner from 'qr-scanner';
import { useRef, useState, useEffect, useCallback } from 'react';

import { Box, Modal, Button, Container, Typography } from '@mui/material';

import axiosInstance from 'src/utils/axios';

const QrReader = () => {
  const scanner = useRef(null);
  const videoRef = useRef(null);
  const qrBoxRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [scannedResult, setScannedResult] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [ticketMatch, setTicketMatch] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [attendeesData, setAttendeesData] = useState([]);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [cameraScannerActive, setCameraScannerActive] = useState(false);

  const fetchTicketDatabase = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/attendees');
      const ticketIDs = response.data.map((obj) => obj.ticketID);
      setAttendeesData(response.data);
      return { ticketIDs };
    } catch (error) {
      console.error('Error fetching attendees:', error);
      throw error;
    }
  }, []);

  const updateAttendees = useCallback(
    async (id) => {
      try {
        await axiosInstance.patch(
          `/api/attendee/update/${id}`,
          { attendance: 'attended' },
          { headers: { 'content-type': 'multipart/form-data' } }
        );
        await fetchTicketDatabase();
      } catch (error) {
        console.error('Error updating attendance:', error);
      }
    },
    [fetchTicketDatabase]
  );

  const handleVerify = useCallback(async () => {
    try {
      if (ticketMatch) {
        setVerificationInProgress(true);

        const scannedAttendee = attendeesData.filter(
          (attendee) => attendee.ticketID === scannedResult
        );

        const updateEmail = async (id, newEmail) => {
          try {
            await axiosInstance.patch(
              `/api/attendee/update/${id}`,
              { buyerEmail: newEmail },
              { headers: { 'content-type': 'application/json' } }
            );
            await fetchTicketDatabase();
          } catch (error) {
            console.error('Error updating email:', error);
          }
        };

        const uniqueEmails = [...new Set(scannedAttendee.map((attendee) => attendee.buyerEmail))];

        const listEmails = attendeesData
          .filter((attendee) => uniqueEmails.includes(attendee.buyerEmail))
          .map(({ id, buyerEmail, ticketID }) => ({ id, buyerEmail, ticketID }));

        if (scannedAttendee.length > 0) {
          if (listEmails.length === 1) {
            await updateAttendees(scannedAttendee[0].id);
          } else {
            const confirmEmail = window.confirm(
              `Multiple emails associated with this ticket. Click yes to update only your ticket ID ${scannedAttendee} attendance. Click no to update the other ticket ID's emails associated.`
            );
            if (!confirmEmail) {
              const oppositeTicket = listEmails.find(({ ticketID }) => ticketID !== scannedResult);
              if (oppositeTicket) {
                const newEmail = prompt(
                  `Enter new email for ticket ID ${oppositeTicket.ticketID}:`
                );
                if (newEmail !== null) {
                  await updateEmail(oppositeTicket.id, newEmail);
                }
              } else {
                console.error('Opposite ticket not found.');
              }
            } else {
              await updateAttendees(scannedAttendee[0].id);
            }
          }
          setIsVerified(true);
        } else {
          console.log('Attendee not found for scanned ticket ID:', scannedResult);
        }
      } else {
        console.log('Verification failed! Scanned QR does not match any ticket in the database.');
        setIsVerified(false);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    } finally {
      setVerificationInProgress(false);
    }
  }, [ticketMatch, updateAttendees, attendeesData, scannedResult, fetchTicketDatabase]);

  useEffect(() => {
    const handleScanSuccess = async (result) => {
      const scannedData = result?.data.trim();
      setScannedResult(scannedData);
      setOpenModal(true);

      try {
        const { ticketIDs } = await fetchTicketDatabase();
        if (ticketIDs.includes(scannedData)) {
          console.log('Scanned QR matches');
          setTicketMatch(true);
        } else {
          console.log('Not match');
          setTicketMatch(false);
        }
      } catch (error) {
        console.error('Error checking ticket ID:', error);
      }
    };

    if (cameraScannerActive && videoRef?.current && !scanner.current) {
      scanner.current = new QrScanner(videoRef?.current, handleScanSuccess, {
        onDecodeError: (err) => console.error(err),
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxRef?.current || undefined,
      });

      scanner?.current
        ?.start()
        .then(() => setCameraOn(true))
        .catch((err) => {
          console.error(err);
          setCameraOn(false);
        });
    }

    if (!cameraScannerActive && scanner?.current) {
      scanner.current.stop();
    }

    return () => {
      if (scanner?.current) {
        scanner.current.stop();
      }
    };
  }, [fetchTicketDatabase, cameraScannerActive]);

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

  const handleCamera = () => {
    setOpenModal(false);
    setCameraScannerActive(true);
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
        {cameraScannerActive && (
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
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto' }} />
          </Box>
        )}

        {!cameraScannerActive && (
          <Button onClick={handleCamera} variant="contained" color="primary">
            Scan QR
          </Button>
        )}

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
          <Button
            size="medium"
            variant="contained"
            color="primary"
            fullWidth
            disabled={!ticketMatch || verificationInProgress}
            onClick={handleVerify}
          >
            Submit Attendance
          </Button>
          {isVerified && <Typography>Submitted</Typography>}
          {!isVerified && <Typography>Not yet submit</Typography>}
        </Box>
      </Modal>
    </Container>
  );
};

export default QrReader;
