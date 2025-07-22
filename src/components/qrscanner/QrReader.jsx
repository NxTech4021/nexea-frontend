/* eslint-disable no-unneeded-ternary */
import useSWR from 'swr';
import { toast } from 'sonner';
import QrScanner from 'qr-scanner';
import styled from '@emotion/styled';
import { useParams } from 'react-router';
import { useTheme } from '@emotion/react';
import 'react-toastify/dist/ReactToastify.css';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

// import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Box,
  Chip,
  Grid,
  Modal,
  alpha,
  Stack,
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material';

import { fetcher, endpoints, axiosInstance } from 'src/utils/axios';

import Iconify from 'src/components/iconify';

const AttendanceStatus = {
  present: 'Yes',
  absent: 'No',
};

const LANYARD_COLOR = {
  Startups: 'Green',
};

const TabsWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[900], 0.7) : '#f2f5f7',
  borderRadius: 14,
  padding: '8px',
  display: 'flex',
  width: '100%',
  minWidth: 400,
  marginBottom: 16,
  marginTop: 10,
  border:
    theme.palette.mode === 'dark' ? `1px solid ${alpha(theme.palette.common.white, 0.1)}` : 'none',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    minWidth: 'unset',
    height: 200,
  },
}));

const TabButton = styled(Button)(({ theme, selected }) => {
  let textColor;
  if (selected) {
    textColor = theme.palette.mode === 'dark' ? '#ffffff' : '#000000';
  } else {
    textColor = theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.5) : '#68737f';
  }

  const hoverColor = theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary;

  return {
    position: 'relative',
    width: '50%',
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: 600,
    color: textColor,
    zIndex: 1,
    transition: 'color 0.3s ease',
    '&:hover': {
      backgroundColor: 'transparent',
      color: hoverColor,
    },
    justifyContent: 'flex-start',
    paddingLeft: '32px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: '50%',
    },
  };
});

const SliderIndicator = styled('div')(({ activeTab, theme }) => ({
  position: 'absolute',
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.grey[800], 0.9)
      : theme.palette.background.paper,
  boxShadow:
    theme.palette.mode === 'dark'
      ? `0 0 8px 2px ${alpha(theme.palette.common.black, 0.5)}`
      : '0 2px 8px rgba(0, 0, 0, 0.05)',
  borderRadius: 10,
  transition: 'all 0.3s ease',
  border:
    theme.palette.mode === 'dark' ? `1px solid ${alpha(theme.palette.common.white, 0.1)}` : 'none',
  zIndex: 0,
  [theme.breakpoints.up('sm')]: {
    left: activeTab === 0 ? '8px' : 'calc(50% + 4px)',
    width: 'calc(50% - 12px)',
    height: 'calc(100% - 16px)',
    top: '8px',
  },
  [theme.breakpoints.down('sm')]: {
    left: '8px',
    width: 'calc(100% - 16px)',
    height: 'calc(50% - 12px)',
    top: activeTab === 0 ? '8px' : 'calc(50% + 4px)',
  },
}));

const QrReader = () => {
  const theme = useTheme();
  const { eventId } = useParams();
  const scanner = useRef(null);
  const videoRef = useRef(null);
  const qrBoxRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
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

  const [showAttendeeModal, setShowAttendeeModal] = useState(false);
  const [scannedAttendeeDetail, setScannedAttendeeDetail] = useState(null);

  // Uncommand this if want to straight away update attendance for ticketCode that does not has any redundant buyerEmail
  // const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [openModalEmail, setOpenModalEmail] = useState(false);
  const [ticketMatch, setTicketMatch] = useState(null);
  const [cameraScannerActive, setCameraScannerActive] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [event, setEvent] = useState({});

  // Use SWR for real-time data fetching
  const { data, isLoading, error, mutate } = useSWR(
    `${endpoints.attendee.root}?eventId=${eventId}`,
    fetcher
  );
    const attendeesData = useMemo(() => data?.attendees || [], [data]);

  const [searchQuery, setSearchQuery] = useState('');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('All');

  // Place ticketTypes and filteredAttendees here:
  const ticketTypes = useMemo(() => {
    const types = new Set();
    attendeesData.forEach(a => {
      if (a.ticket?.ticketType?.title) types.add(a.ticket.ticketType.title);
    });
    return Array.from(types);
  }, [attendeesData]);

  const filteredAttendees = attendeesData?.filter(
    (attendee) => {
      const matchesTab =
        (activeTab === 0 && attendee.status === 'pending') ||
        (activeTab === 1 && attendee.status === 'checkedIn');
      const matchesSearch =
        attendee.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTicketType =
        ticketTypeFilter === 'All' ||
        attendee.ticket?.ticketType?.title === ticketTypeFilter;
      return matchesTab && matchesSearch && matchesTicketType;
    }
  );

  const fetchTicketDatabase = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${endpoints.attendee.root}?eventId=${eventId}`);
      const attendees = response?.data?.attendees || [];
      const ticketCode = attendees.map((obj) => obj.ticket.ticketCode);
      return { ticketCode };
    } catch (err) {
      console.error('Error fetching attendees:', err);
      throw err;
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
        console.log(`Attempting to update attendee with ID: ${id}`);
        if (!id) {
          console.error('Error updating attendance: ID is undefined or null');
          return toast.error('Failed to update attendance: Invalid attendee ID');
        }
        
        const response = await axiosInstance.patch(`${endpoints.attendee.update}/${id}`, {});
        console.log('Update response:', response);
        toast.success(`${response.data.attendee.firstName} successfully checked in`);
        // Refresh the attendees data after successful check-in
        mutate();
      } catch (err) {
        console.error('Error updating attendance:', err);
        // Display more specific error message
        const errorMessage = err.response?.data?.message || err.message || 'Failed to update attendance';
        toast.error(errorMessage);
      }
    },
    [mutate]
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
      mutate();
      setScannedAttendee((prev) => ({
        ...prev,
        email: '',
        name: '',
        companyName: '',
        phoneNumber: '',
        ticketType: '',
      }));
    } catch (err) {
      console.error('Error updating email:', err);
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
          console.log('Verifying ticket code:', scannedResult);
          const attendeeData = attendeesData.find(
            (attendee) => attendee.ticket?.ticketCode === scannedResult
          );

          if (attendeeData) {
            console.log('Found attendee:', attendeeData);
            if (attendeeData?.status === 'checkedIn') {
              return toast.warning(`${attendeeData.firstName} is already checked in.`);
            }

            // Make sure we have a valid ID before updating
            if (!attendeeData.id) {
              return toast.error('Cannot update attendance: Missing attendee ID');
            }
            
            await updateAttendees(attendeeData.id);
          } else {
            console.error('Attendee not found for scanned ticket ID:', scannedResult);
            return toast.error('Attendee not found for this ticket');
          }
        } else {
          return toast.error('Scanned result is empty.');
        }
      } else {
        return toast.error('QR does not match any ticket in the database');
      }
    } catch (err) {
      console.log('Error in handleVerify:', err);
      return toast.error(`Error updating attendance: ${err.message || 'Unknown error'}`);
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
      try {
        if (!result?.data) {
          console.error('No data found in QR code scan result');
          toast.error('Invalid QR code');
          return false;
        }
        
        const scannedData = result.data.trim();
        console.log('QR code scanned:', scannedData);
        setScannedResult(scannedData);
        
        const { ticketCode } = await fetchTicketDatabase();
        
        if (!ticketCode || !ticketCode.length) {
          console.error('No ticket codes found in database');
          toast.error('Error fetching tickets database');
          return false;
        }
        
        if (ticketCode.includes(scannedData)) {
          // Find attendee details
          const attendee = attendeesData.find((a) => a.ticket?.ticketCode === scannedData);
          if (!attendee) {
            console.error('Ticket found but no matching attendee record');
            toast.warning('Ticket found but attendee details missing');
            return false;
          }
          
          setScannedAttendeeDetail(attendee);
          setShowAttendeeModal(true);
          setCameraScannerActive(false); // Stop camera while modal is open
          return setTicketMatch(true);
        }
        
        toast.warning('Ticket ID not found in database.');
        return setTicketMatch(false);
      } catch (err) {
        console.error('Error processing QR code:', err);
        toast.error('Error processing QR code');
        return false;
      }
    };

    //   if (cameraScannerActive && videoRef?.current && !scanner.current) {
    //     scanner.current = new QrScanner(videoRef?.current, handleScanSuccess, {
    //       // onDecodeError: (err) => console.error(err),
    //       preferredCamera: 'environment',
    //       highlightScanRegion: true,
    //       highlightCodeOutline: true,
    //       maxScansPerSecond: 1,
    //       overlay: qrBoxRef?.current || undefined,
    //     });

    //     scanner?.current
    //       ?.start()
    //       .then(() => setCameraOn(true))
    //       .catch((err) => {
    //         setCameraOn(false);
    //       });
    //   }

    //   if (!cameraScannerActive && scanner?.current) {
    //     scanner.current.stop();
    //   }

    //   return () => {
    //     if (scanner?.current) {
    //       scanner.current.stop();
    //     }
    //   };
    // }, [fetchTicketDatabase, cameraScannerActive]);
    if (cameraScannerActive && videoRef?.current && !scanner.current) {
      scanner.current = new QrScanner(videoRef?.current, handleScanSuccess, {
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
  }, [fetchTicketDatabase, cameraScannerActive, attendeesData]);
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
        const eventData = await axiosInstance.get(`${endpoints.events.event}/${eventId}`);
        setEvent(eventData);
      } catch (err) {
        toast.error('Error fetching event in QR page');
      }
    };

    getEvent();
  }, [eventId]);

  const checkedInCount = attendeesData?.filter(
    (attendee) => attendee.status === 'checkedIn'
  ).length;

  const notCheckedInCount = attendeesData?.filter(
    (attendee) => attendee.status === 'pending'
  ).length;

  // x

  return (
    <Container maxWidth="lg">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 2 }} sx={{ mb: 3 }}>
        {/* QR Scanner Section */}
        <Box
          sx={{
            height: { xs: '40vh', md: '85vh' },
            bgcolor: '#cfe8fc',
            position: 'relative',
            borderRadius: 2,
            width: { xs: '100%', md: '50%' },
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
              <video
                ref={videoRef}
                autoPlay
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 10,
                }}
              >
                <track kind="captions" label="QR Scanner Feed" />
              </video>
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
                    maxWidth: '80%',
                    maxHeight: '80%',
                    width: 'auto',
                    height: 'auto',
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
                textAlign: 'center',
              }}
            >
              <Button
                onClick={handleCamera}
                variant="contained"
                startIcon={<Iconify icon="eva:camera-outline" width={22} />}
                sx={{
                  height: { xs: 40, md: 48 },
                  borderRadius: 1.5,
                  fontWeight: 600,
                  boxShadow: 'none',
                  bgcolor: theme.palette.mode === 'light' ? '#111' : '#fff',
                  color: theme.palette.mode === 'light' ? '#fff' : '#111',
                  px: 3,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'light' ? '#222' : '#f9f9f9',
                  },
                }}
              >
                Scan QR
              </Button>
            </Box>
          )}
        </Box>

        {/* Vertical Divider - Only show on desktop */}
        <Box
          sx={{
            width: '1px',
            bgcolor: theme.palette.mode === 'light' ? '#e0e0e0' : '#333',
            my: 2,
            display: { xs: 'none', md: 'block' },
          }}
        />

        {/* Attendee List Section */}
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: 'auto', md: '85vh' },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: '600px' } }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Attendees
                </Typography>
                <Typography
                  variant="h6"
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    marginTop: '2px',
                  }}
                >
                  {attendeesData?.length}
                </Typography>
              </div>
            </div>

            <TabsWrapper>
              <SliderIndicator activeTab={activeTab} />
              <TabButton selected={activeTab === 0} onClick={() => setActiveTab(0)} disableRipple>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#ea3323',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="/assets/userNotCheckedIn.svg"
                      alt="NotCheckedIn"
                      style={{ height: '30px' }}
                    />
                  </div>
                  <div
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <span style={{ marginBottom: '-3px', fontWeight: '550', fontSize: '14px' }}>
                      Not Checked In
                    </span>
                    <Typography variant="body2" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                      {notCheckedInCount}
                    </Typography>
                  </div>
                </Stack>
              </TabButton>

              <TabButton selected={activeTab === 1} onClick={() => setActiveTab(1)} disableRipple>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#7cd640',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="/assets/userCheckedIn.svg"
                      alt="CheckedIn"
                      style={{ height: '30px' }}
                    />
                  </div>
                  <div
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <span style={{ marginBottom: '-3px', fontWeight: '550', fontSize: '14px' }}>
                      Checked In
                    </span>
                    <Typography variant="body2" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                      {checkedInCount}
                    </Typography>
                  </div>
                </Stack>
              </TabButton>
            </TabsWrapper>

            <Box
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor:
                    theme.palette.mode === 'light'
                      ? '#f3f3f3'
                      : alpha(theme.palette.grey[500], 0.12),
                  display: { xs: 'none', md: 'flex' },
                }}
              >
                <Typography
                  sx={{
                    width: '30%',
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Name
                </Typography>
                <Typography
                  sx={{
                    width: '35%',
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Company
                </Typography>
                <Typography
                  sx={{
                    width: '35%',
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Ticket Type
                </Typography>
              </Stack>

              <Stack sx={{ maxHeight: '48vh', overflow: 'auto' }}>
                {filteredAttendees.map((attendee, index) => (
                  <Stack
                    key={index}
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'light'
                            ? '#f3f3f3'
                            : alpha(theme.palette.grey[500], 0.12),
                      },
                    }}
                  >
                    {/* Mobile layout - Card style */}
                    <Box
                      sx={{
                        display: { xs: 'flex', md: 'none' },
                        flexDirection: 'column',
                        width: '100%',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                          Name:
                        </Typography>
                        <Typography
                          sx={{ color: theme.palette.text.primary, fontSize: 13, fontWeight: 500 }}
                        >
                          {`${attendee.firstName} ${attendee.lastName}`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                          Company:
                        </Typography>
                        <Typography
                          sx={{ color: theme.palette.text.primary, fontSize: 13, fontWeight: 500 }}
                        >
                          {attendee.companyName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
                          Ticket Type:
                        </Typography>
                        <Chip
                          label={attendee.ticket.ticketType.title}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: '0.75rem',
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Desktop layout - row style */}
                    <Typography
                      sx={{
                        width: '30%',
                        color: theme.palette.text.primary,
                        fontSize: 13,
                        display: { xs: 'none', md: 'block' },
                      }}
                    >
                      {`${attendee.firstName} ${attendee.lastName}`}
                    </Typography>
                    <Typography
                      sx={{
                        width: '35%',
                        color: theme.palette.text.primary,
                        fontSize: 13,
                        display: { xs: 'none', md: 'block' },
                      }}
                    >
                      {attendee.companyName}
                    </Typography>
                    <Box
                      sx={{
                        width: '35%',
                        display: { xs: 'none', md: 'flex' },
                      }}
                    >
                      <Chip
                        label={attendee.ticket.ticketType.title}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Stack>

      {/* Your existing Modal */}
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
      {/* A Popout taht comes out a */}
      <Modal
        open={showAttendeeModal}
        onClose={() => setShowAttendeeModal(false)}
        aria-labelledby="attendee-modal-title"
        aria-describedby="attendee-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 350, md: 400 },
            maxWidth: 400,
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }}
        >
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ mb: 3 }}
          >
            <Box 
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography
              id="attendee-modal-title"
              variant="h6"
              sx={{ textAlign: 'center', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              QR Scanned Attendee Details
            </Typography>

            <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
              Successfully scanned
            </Typography>
          </Stack>

          {scannedAttendeeDetail ? (
            <Box 
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                mb: 3
              }}
            >
              <Grid container spacing={2}>
                {/* Name */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Name:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {scannedAttendeeDetail.firstName} {scannedAttendeeDetail.lastName}
                  </Typography>
                </Grid>

                {/* Company */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Company:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {scannedAttendeeDetail.companyName}
                  </Typography>
                </Grid>

                {/* Ticket Type */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Ticket Type:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {scannedAttendeeDetail.ticket?.ticketType?.title}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography>No attendee found.</Typography>
          )}

          {/* Button aligned center */}
          <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setShowAttendeeModal(false);
                if (scanner.current) {
                  console.log('Destroying scanner instance before creating a new one');
                  scanner.current.destroy?.();
                  scanner.current = null;
                }
                setCameraScannerActive(true);
              }}
              sx={{ 
                py: { xs: 1, sm: 1.2 },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Done
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Container>
  );
};

export default QrReader;
