/* eslint-disable no-unneeded-ternary */
import QrScanner from 'qr-scanner';
import { toast } from 'react-toastify';
import { useParams } from 'react-router';
import { useTheme } from '@emotion/react';
import 'react-toastify/dist/ReactToastify.css';
import { useRef, useState, useEffect, useCallback } from 'react';

import { Box, Modal, Button, Container, TextField, Typography } from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

const AttendanceStatus = {
  present: 'Yes',
  absent: 'No',
};

const QrReader = () => {
  const theme = useTheme();
  const { eventId } = useParams();
  const scanner = useRef(null);
  const videoRef = useRef(null);
  const qrBoxRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);

  const [scannedResult, setScannedResult] = useState('');
  const [scannedName, setScannedName] = useState('');
  const [scannedEmail, setScannedEmail] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  // Uncommand this if want to straight away update attendance for ticketCode that does not has any redundant buyerEmail
  // const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [openModalEmail, setOpenModalEmail] = useState(false);
  const [ticketMatch, setTicketMatch] = useState(null);
  const [attendeesData, setAttendeesData] = useState([]);
  const [cameraScannerActive, setCameraScannerActive] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [event, setEvent] = useState({});

  const fetchTicketDatabase = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${endpoints.attendee.event.list}/${eventId}`);
      const ticketCode = response.data.map((obj) => obj.ticketCode);
      setAttendeesData(response.data);
      return { ticketCode };
    } catch (error) {
      console.error('Error fetching attendees:', error);
      throw error;
    }
  }, [eventId]);

  // eslint-disable-next-line consistent-return
  const isCheckIn = async (id) => {
    try {
      // const { data } = await axiosInstance.get(`${endpoints.attendee.checkedIn}/${id}`);
      console.log(id);
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
          `${endpoints.attendee.update}/${id}`,
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
  const updateInfo = async (id, newEmail, newName) => {
    try {
      const emailToUpdate = newEmail ? newEmail : scannedEmail;
      const nameToUpdate = newName ? newName : scannedName;
      await axiosInstance.patch(
        `${endpoints.attendee.update}/${id}`,
        {
          name: nameToUpdate,
          email: emailToUpdate,
        },
        { headers: { 'content-type': 'application/json' } }
      );
      await fetchTicketDatabase();
      setNewEmail('');
      setNewName('');
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const handleSubmitButtonClick = async () => {
    if (scannedResult) {
      const scannedAttendee = attendeesData.find(
        (attendee) => attendee.ticketCode === scannedResult
      );
      if (scannedAttendee) {
        const ownerTicketCode = attendeesData.filter(
          (attendee) =>
            attendee.email === scannedAttendee.email &&
            attendee.ticketCode === scannedAttendee.ticketCode
        );
        if (ownerTicketCode) {
          await updateInfo(ownerTicketCode[0].id, newEmail, newName);
          await updateAttendees(scannedAttendee.id);
          toast.success(`Attendance updated successfully for ${scannedResult}`);
        }
      } else {
        console.log('Attendee not found for scanned ticket ID:', scannedResult);
      }
    } else {
      console.log('Scanned result is empty or ticket does not match.');
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
            setScannedEmail(scannedAttendee.email);
            if (
              attendeesData.filter((attendee) => attendee.buyerEmail === scannedAttendee.buyerEmail)
                .length > 1
            ) {
              setOpenModalEmail(true);
            } else {
              // Uncommand this if want to straight away update attendance for ticketCode that does not has any redundant buyerEmail
              // setOpenModalConfirm(true);
              setOpenModalEmail(true);
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

  // Uncommand this if want to straight away update attendance for ticketCode that does not has any redundant buyerEmail
  // const handleCloseModalConfirm = () => {
  //   setOpenModalConfirm(false);
  //   toast.success(`Attendance updated successfully for ${scannedResult}`);
  // };

  const handleCamera = () => {
    setOpenModalEmail(false);
    setCameraScannerActive(true);
  };

  useEffect(() => {
    const handleScanSuccess = async (result) => {
      const scannedData = result?.data.trim();
      setScannedResult(scannedData);
      try {
        const { ticketCode } = await fetchTicketDatabase();
        if (ticketCode.includes(scannedData)) {
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

      {/* Uncommand this if want to straight away update attendance for ticketCode that does not has any redundant buyerEmail */
      /* <Modal
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
      </Modal> */}
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
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 2,
            borderRadius: '8px',
            textAlign: 'center',
            color: theme.palette.grey[100],
          }}
        >
          <Typography id="modal-email-title" variant="h6" component="h6">
            Attendance Update Form
          </Typography>
          <Typography id="modal-email-description" sx={{ mt: 2, margin: '10px' }}>
            Please confirm your data
          </Typography>
          <TextField
            label="Name"
            variant="outlined"
            defaultValue={scannedName}
            onChange={(e) => setNewName(e.target.value)}
            sx={{ mt: 2, width: '100%' }}
            color="primary"
          />
          <TextField
            label="Email"
            variant="outlined"
            defaultValue={scannedEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            sx={{ mt: 2, width: '100%' }}
          />
          <Button
            onClick={handleSubmitButtonClick}
            variant="contained"
            color="primary"
            sx={{ ml: 1, margin: '10px' }}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default QrReader;
