import QrScanner from 'qr-scanner';
import { toast } from 'react-toastify';
import { useParams } from 'react-router';
import 'react-toastify/dist/ReactToastify.css';
import { useRef, useState, useEffect, useCallback } from 'react';

import { Box, Modal, Button, Container, TextField, Typography } from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

const AttendanceStatus = {
  present: 'Yes',
  absent: 'No',
};

const QrReader = () => {
  const { eventId } = useParams();
  const scanner = useRef(null);
  const videoRef = useRef(null);
  const qrBoxRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [scannedResult, setScannedResult] = useState('');
  const [scannedName, setScannedName] = useState('');
  const [scannedEmail, setScannedEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [openModalEmail, setOpenModalEmail] = useState(false);
  const [ticketMatch, setTicketMatch] = useState(null);
  const [attendeesData, setAttendeesData] = useState([]);
  const [cameraScannerActive, setCameraScannerActive] = useState(false);
  const [showNewEmailInput, setShowNewEmailInput] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [event, setEvent] = useState({});

  const fetchTicketDatabase = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/attendees');
      const ticketIDs = response.data.map((obj) => obj.ticketCode);
      setAttendeesData(response.data);
      return { ticketIDs };
    } catch (error) {
      console.error('Error fetching attendees:', error);
      throw error;
    }
  }, []);

  // eslint-disable-next-line consistent-return
  const isCheckIn = async (id) => {
    try {
      const { data } = await axiosInstance.get(`/api/attendee/${id}`);

      if (data?.checkedIn === 'Yes') {
        return true;
      }
      return false;
    } catch (error) {
      return error;
    }
  };

  const updateAttendees = useCallback(
    async (id) => {
      try {
        await axiosInstance.patch(
          `/api/attendee/update/${id}`,
          { checkedIn: AttendanceStatus.present },
          { headers: { 'content-type': 'application/json' } }
        );
        await fetchTicketDatabase();
      } catch (error) {
        console.error('Error updating attendance:', error);
      }
    },
    [fetchTicketDatabase]
  );

  // eslint-disable-next-line no-shadow
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

  const handleYesButtonClick = async () => {
    if (newEmail !== '') {
      if (scannedResult) {
        const scannedAttendee = attendeesData.find(
          (attendee) => attendee.ticketID === scannedResult
        );
        if (scannedAttendee) {
          const ownerTicketID = attendeesData.filter(
            (attendee) =>
              attendee.buyerEmail === scannedAttendee.buyerEmail &&
              attendee.ticketID === scannedAttendee.ticketID
          );
          if (ownerTicketID) {
            await updateEmail(ownerTicketID[0].id, newEmail);
            await updateAttendees(scannedAttendee.id);
            toast.success(`Attendance updated successfully for ${scannedResult}`);
          }
        } else {
          console.log('Attendee not found for scanned ticket ID:', scannedResult);
        }
      } else {
        console.log('Scanned result is empty or ticket does not match.');
      }
    } else {
      console.error('New email is required.');
    }
    setOpenModalEmail(false);
  };

  const handleNoButtonClick = async () => {
    if (scannedResult) {
      const scannedAttendee = attendeesData.find((attendee) => attendee.ticketID === scannedResult);
      if (scannedAttendee) {
        await updateAttendees(scannedAttendee.id);
        toast.success(`Attendance updated successfully for ${scannedResult}`);
      } else {
        console.log('Attendee not found for scanned ticket ID:', scannedResult);
      }
    }
    setOpenModalEmail(false);
  };

  // eslint-disable-next-line consistent-return
  const handleVerify = useCallback(async () => {
    try {
      if (ticketMatch) {
        setTicketMatch(false);
        if (scannedResult) {
          const scannedAttendee = attendeesData.find(
            (attendee) => attendee.ticketCode === scannedResult
          );
          if (scannedAttendee) {
            if (await isCheckIn(scannedAttendee.id)) {
              return toast.warn(`${scannedAttendee.name} is already checked in.`);
            }
            setScannedName(scannedAttendee.name);
            setScannedEmail(scannedAttendee.buyerEmail);
            if (
              attendeesData.filter((attendee) => attendee.buyerEmail === scannedAttendee.buyerEmail)
                .length > 1
            ) {
              setOpenModalEmail(true);
            } else {
              setOpenModalConfirm(true);
              await updateAttendees(scannedAttendee.id);
            }
          } else {
            return toast.error('Attendee not found for scanned ticket ID:', scannedResult);
          }
        } else {
          return toast.error('Scanned result is empty.');
        }
      } else {
        return toast.error('QR does not match any ticket in the database');
      }
    } catch (error) {
      return toast.error('Error updating attendance:');
      // console.error('Error updating attendance:', error);
    }
  }, [ticketMatch, scannedResult, attendeesData, updateAttendees]);

  const handleCloseModalEmail = () => {
    setOpenModalEmail(false);
  };

  const handleCloseModalConfirm = () => {
    setOpenModalConfirm(false);
    toast.success(`Attendance updated successfully for ${scannedResult}`);
  };

  const handleCamera = () => {
    setOpenModalEmail(false);
    setCameraScannerActive(true);
  };

  const textfieldEmail = () => {
    setShowNewEmailInput(true);
  };

  useEffect(() => {
    const handleScanSuccess = async (result) => {
      const scannedData = result?.data.trim();
      setScannedResult(scannedData);
      try {
        const { ticketIDs } = await fetchTicketDatabase();
        if (ticketIDs.includes(scannedData)) {
          return setTicketMatch(true);
        }
        toast.warn('Ticket ID not found.');
        return setTicketMatch(false);
      } catch (error) {
        console.error('Error checking ticket ID:', error);
        return error;
      }
    };

    if (cameraScannerActive && videoRef?.current && !scanner.current) {
      scanner.current = new QrScanner(videoRef?.current, handleScanSuccess, {
        // onDecodeError: (err) => console.error(err),
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 1,
        overlay: qrBoxRef?.current || undefined,
      });

      scanner?.current
        ?.start()
        .then(() => setCameraOn(true))
        .catch((err) => {
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

  useEffect(() => {
    if (ticketMatch) {
      handleVerify();
    }
  }, [handleVerify, ticketMatch]);

  useEffect(() => {
    const getEvent = async () => {
      try {
        const data = await axiosInstance.get(`${endpoints.events.event}/${eventId}`);
        setEvent(data);
      } catch (error) {
        toast.error('Error fetching event in QR page');
      }
    };

    getEvent();
  }, [eventId]);

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          height: '85vh',
          bgcolor: '#cfe8fc',
          position: 'relative',
          borderRadius: 2,
        }}
      >
        {cameraScannerActive && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              margin: 'auto',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 10,
              }}
            />
            <Box ref={qrBoxRef}>
              <img
                src="/test.svg"
                alt="qr"
                width={256}
                height={256}
                style={{
                  position: 'absolute',
                  fill: 'none',
                  left: '50%',
                  top: '50%',
                  transform: 'translateX(-50%) translateY(-50%)',
                }}
              />
            </Box>
          </Box>
        )}

        {!cameraScannerActive && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-50%)',
            }}
          >
            <Button
              onClick={handleCamera}
              variant="contained"
              color="primary"
              style={{ marginBottom: '20px' }}
            >
              Scan QR
            </Button>
          </Box>
        )}
      </Box>

      <Modal
        open={openModalConfirm}
        onClose={handleCloseModalConfirm}
        aria-labelledby="modal-email-title"
        aria-describedby="modal-email-description"
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
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <Typography id="modal-email-title" variant="h6" component="h6">
            Attendance Update Form
          </Typography>
          <Typography id="modal-email-title" sx={{ mt: 2, margin: '10px' }}>
            {scannedName} {scannedEmail}
          </Typography>
        </Box>
      </Modal>
      <Modal
        open={openModalEmail}
        onClose={handleCloseModalEmail}
        aria-labelledby="modal-email-title"
        aria-describedby="modal-email-description"
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
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <Box sx={{ mt: 2 }}>
            {!showNewEmailInput && (
              <div>
                <Typography id="modal-email-title" variant="h6" component="h6">
                  Attendance Update Form
                </Typography>
                <Typography id="modal-email-description" sx={{ mt: 2, margin: '10px' }}>
                  {scannedName} {scannedEmail}
                </Typography>
                <Typography id="modal-email-description" sx={{ mt: 2, margin: '10px' }}>
                  Please confirm your data
                </Typography>
                <Button onClick={handleNoButtonClick} variant="contained" color="secondary">
                  Yes
                </Button>
                <Button
                  onClick={textfieldEmail}
                  variant="contained"
                  color="primary"
                  sx={{ ml: 1, margin: '10px' }}
                >
                  No
                </Button>
              </div>
            )}
            {showNewEmailInput && (
              <div>
                <Typography id="modal-email-title" variant="h6" component="h6">
                  Change Email Form
                </Typography>
                <Typography id="modal-email-description" sx={{ mt: 2, margin: '10px' }}>
                  Please enter a new email
                </Typography>
                <TextField
                  label="New Email"
                  variant="outlined"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  sx={{ mt: 2, width: '100%' }}
                />
                <Button
                  onClick={handleYesButtonClick}
                  variant="contained"
                  color="primary"
                  sx={{ ml: 1, margin: '10px' }}
                >
                  Update Your Email and Attendance
                </Button>
              </div>
            )}
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default QrReader;
