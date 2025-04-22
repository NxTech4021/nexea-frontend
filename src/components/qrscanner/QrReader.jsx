/* eslint-disable no-unneeded-ternary */
import { toast } from 'sonner';
import QrScanner from 'qr-scanner';
import { useParams } from 'react-router';
import { useTheme } from '@emotion/react';
import 'react-toastify/dist/ReactToastify.css';
import { useRef, useState, useEffect, useCallback } from 'react';

import { Box, Modal, Button, Container, TextField, Typography } from '@mui/material';

import { endpoints, axiosInstance } from 'src/utils/axios';

const AttendanceStatus = {
  present: 'Yes',
  absent: 'No',
};

const LANYARD_COLOR = {
  Startups: 'Green',
};

const QrReader = () => {
  const theme = useTheme();
  const { eventId } = useParams();
  const scanner = useRef(null);
  const videoRef = useRef(null);
  const qrBoxRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);

  const [scannedResult, setScannedResult] = useState('');
  // const [scannedName, setScannedName] = useState('');
  // const [scannedEmail, setScannedEmail] = useState('');
  const [scannedAttendee, setScannedAttendee] = useState({
    name: '',
    email: '',
    companyName: '',
    phoneNumber: '',
    ticketType: '',
  });

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

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
      const response = await axiosInstance.get(`${endpoints.attendee.root}?eventId=${eventId}`);
      const attendees = response?.data?.attendees || [];
      const ticketCode = attendees.map((obj) => obj.ticket.ticketCode);
      setAttendeesData(attendees);
      return { ticketCode };
    } catch (error) {
      console.error('Error fetching attendees:', error);
      throw error;
    }
  }, [eventId]);

  // eslint-disable-next-line consistent-return
  // const isCheckIn = async (id) => {
  //   try {
  //     // const { data } = await axiosInstance.get(`${endpoints.attendee.checkedIn}/${id}`);

  //     const { data } = await axiosInstance.get(`/api/attendee/${id}`);

  //     if (data?.checkedIn) {
  //       return true;
  //     }
  //     return false;
  //   } catch (error) {
  //     return error;
  //   }
  // };

  const updateAttendees = useCallback(
    async (id) => {
      try {
        await axiosInstance.patch(`${endpoints.attendee.update}/${id}`, {});
        toast.success('Successfully checked in');
        await fetchTicketDatabase();
      } catch (error) {
        console.error('Error updating attendance:', error);
      }
    },
    [fetchTicketDatabase]
  );

  // eslint-disable-next-line no-shadow
  const updateInfo = async (id, newEmail, newName, newCompany, newPhoneNumber) => {
    try {
      const emailToUpdate = newEmail ? newEmail : scannedAttendee.email;
      const companyNameToUpdate = newCompany ? newCompany : scannedAttendee.companyName;
      const nameToUpdate = newName ? newName : scannedAttendee.name;

      await axiosInstance.patch(
        endpoints.attendee.checkIn,
        {
          name: nameToUpdate,
          email: emailToUpdate,
          companyName: companyNameToUpdate,
          phoneNumber: newPhoneNumber || scannedAttendee.phoneNumber,
          id,
        },
        { headers: { 'content-type': 'application/json' } }
      );
      await fetchTicketDatabase();
      setScannedAttendee((prev) => ({
        ...prev,
        email: '',
        name: '',
        companyName: '',
        phoneNumber: '',
        ticketType: '',
      }));
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const handleSubmitButtonClick = async () => {
    if (scannedResult) {
      const attendeeData = attendeesData.find((attendee) => attendee.ticketCode === scannedResult);
      if (attendeeData) {
        const ownerTicketCode = attendeesData.filter(
          (attendee) =>
            attendee.email === attendeeData.email && attendee.ticketCode === attendeeData.ticketCode
        );
        if (ownerTicketCode) {
          await updateInfo(
            ownerTicketCode[0].id,
            newEmail,
            newName,
            newCompanyName,
            newPhoneNumber
          );
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
          const attendeeData = attendeesData.find(
            (attendee) => attendee.ticket.ticketCode === scannedResult
          );

          console.log(attendeeData);

          if (attendeeData) {
            if (attendeeData?.status === 'checkedIn') {
              return toast.warning(`${attendeeData.firstName} is already checked in.`);
            }
            updateAttendees(attendeeData.id);
            // setScannedAttendee((prev) => ({
            //   ...prev,
            //   email: attendeeData.attendeeEmail,
            //   name: attendeeData.attendeeFullName,
            //   companyName: attendeeData.companyName,
            //   phoneNumber: attendeeData.phoneNumber,
            //   ticketType: attendeeData.ticketType,
            // }));

            // if (attendeesData.find((attendee) => attendee.buyerEmail === attendeeData.buyerEmail)) {
            //   setOpenModalEmail(true);
            // } else {
            //   // Uncommand this if want to straight away update attendance for ticketCode that does not has any redundant buyerEmail
            //   // setOpenModalConfirm(true);
            //   setOpenModalEmail(true);
            //   // await updateAttendees(scannedAttendee.id);
            // }
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
      console.log(error);
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
          width: '100%',
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
        aria-labelledby="modal-email-title"
        aria-describedby="modal-email-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 350,
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 2,
            borderRadius: '8px',
            textAlign: 'center',
            color: theme.palette.grey[100],
          }}
        >
          <Typography
            id="modal-email-title"
            variant="h4"
            // component="h6"
            color={theme.palette.text.primary}
          >
            Attendance Update Form
          </Typography>
          {/* <Typography
            id="modal-email-description"
            sx={{ mt: 2, margin: '10px' }}
            color={theme.palette.text.secondary}
          >
            Please confirm your data
          </Typography> */}

          <Typography
            component={Box}
            sx={{
              mt: 2,
              margin: '10px',
              width: 'auto',
              height: 50,
              borderRadius: 2,
              bgcolor: scannedAttendee?.ticketType.includes('Startups') ? '#1a39c2' : '#237a3b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            variant="h6"
          >
            Lanyard color: {scannedAttendee?.ticketType.includes('Startups') ? 'Blue' : 'Green'}
          </Typography>

          <TextField
            label="Phone Number"
            variant="outlined"
            defaultValue={scannedAttendee.phoneNumber}
            onChange={(e) => setNewPhoneNumber(e.target.value)}
            sx={{ mt: 2, width: '100%' }}
            color="primary"
          />
          <TextField
            label="Company Name"
            variant="outlined"
            defaultValue={scannedAttendee.companyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            sx={{ mt: 2, width: '100%' }}
            color="primary"
          />
          <TextField
            label="Name"
            variant="outlined"
            defaultValue={scannedAttendee.name}
            onChange={(e) => setNewName(e.target.value)}
            sx={{ mt: 2, width: '100%' }}
            color="primary"
          />
          <TextField
            label="Email"
            variant="outlined"
            defaultValue={scannedAttendee.email}
            onChange={(e) => setNewEmail(e.target.value)}
            sx={{ mt: 2, width: '100%' }}
          />
          <Button
            onClick={handleSubmitButtonClick}
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              my: 2,
            }}
          >
            Check In
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default QrReader;
