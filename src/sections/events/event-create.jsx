/* eslint-disable import/no-unresolved */
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { Form, Field, Formik, ErrorMessage } from 'formik';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Grid,
  Button,
  Dialog,
  MenuItem,
  Container,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

const CreateEvent = () => {
  const settings = useSettingsContext();
  // const [file, setFile] = useState();

  //  const mdUp = useResponsive('up', 'md');
  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState([]); // State to store users data
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get(endpoints.events.list); // remove/add /api if it doesnt work
      const eventsArray = response.data.events;
      setEvents(eventsArray);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users data from an API
        const response = await axiosInstance.get(endpoints.users.list);
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchEvents();
    fetchUsers();
  }, []);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Function to handle modal close
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // const renderInfo = (
  //   <Grid container>
  //     {mdUp && (
  //       <Grid md={4} >
  //         <Typography variant="h6" sx={{ mb: 0.5 }}>
  //           Details
  //         </Typography>
  //         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
  //           Title, short description, image...
  //         </Typography>
  //       </Grid>
  //     )}

  //     <Grid xs={12} md={8}>
  //       <Card>
  //         <Stack spacing={1.5} sx={{ p: 3 }}>
  //           <Typography variant="subtitle2">Event name</Typography>
  //           <TextField placeholder="Ex: DisruptInvest..." />
  //         </Stack>
  //       </Card>
  //     </Grid>
  //   </Grid>
  // );

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    console.log('Uploaded file:', file);

    // Create a FormData object
    const formData = new FormData();
    formData.append('eventId', selectedEvent);
    formData.append('file', file);

    try {
      // Send the FormData to the backend
      const response = await axiosInstance.post(endpoints.attendee.upload, formData); // remove/add /api if it doesnt work

      if (response.data.message) {
        toast.success('CSV uploaded successfully!');
        handleCloseModal();
      } else {
        toast.error('Error uploading CSV.');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Error uploading CSV. Please try again.');
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create new event"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Event',
            href: paths.dashboard.events.root,
          },
          { name: 'New Event' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <div>
        <h2>Create Event</h2>
        <Formik
          initialValues={{
            name: '',
            description: '',
            date: new Date(),
            personInCharge: '',
            tickera_api: '',
          }}
          validate={(values) => {
            const errors = {};
            if (!values.name) {
              errors.name = 'Required';
            }
            if (!values.date) {
              errors.date = 'Required';
            }
            if (!values.personInCharge) {
              errors.personInCharge = 'Required';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const formattedDate = values.date.toISOString();
              const eventData = {
                name: values.name,
                personInCharge: values.personInCharge,
                description: values.description,
                tickera_api: values.tickera_api,
                date: formattedDate,
              };

              // eslint-disable-next-line no-undef
              const response = await axiosInstance.post(endpoints.events.create, eventData); // remove/add /api if it doesnt work

              // Handle the response
              if (response.data.success) {
                toast.success('Event created successfully!');
                fetchEvents();
                handleOpenModal();
              } else {
                toast.error(`Error creating event: ${response.data.error}`);
              }
            } catch (error) {
              console.error('Error submitting form:', error);
              toast.error('Error submitting form. Please try again.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Field
                    as={TextField}
                    type="text"
                    name="name"
                    label="Event Name"
                    fullWidth
                    required
                  />
                  <ErrorMessage name="name" component="div" />
                </Grid>

                <Grid item xs={6}>
                  <Field
                    as={TextField}
                    select
                    name="personInCharge"
                    label="Person in Charge"
                    fullWidth
                    required
                  >
                    <MenuItem value="">Select Person in Charge</MenuItem>
                    {loading ? (
                      <MenuItem disabled>Loading...</MenuItem>
                    ) : (
                      users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))
                    )}
                  </Field>
                  <ErrorMessage name="personInCharge" component="div" />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    type="text"
                    name="description"
                    label="Event Description"
                    fullWidth
                  />
                  <ErrorMessage name="description" component="div" />
                </Grid>

                <Grid item xs={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      selected={values.date}
                      onChange={(date) => setFieldValue('date', date)}
                      className="form-control"
                    />
                  </LocalizationProvider>
                  <ErrorMessage name="date" component="div" />
                </Grid>

                <Grid item xs={6}>
                  <Field as={TextField} type="text" name="api" label="Tickera API" fullWidth />
                  <ErrorMessage name="api" component="div" />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    fullWidth
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </div>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '90%', sm: '50%', md: '40%' }, // Adjust width for different screen sizes
            maxWidth: '500px',
            minHeight: '300px',
            height: 'auto', // Adjust height to auto to prevent squashing
            overflow: 'auto',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          Upload Csv
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography sx={{ marginTop: 2, marginBottom: 4 }}>Select Event to attach csv</Typography>

          <TextField
            sx={{ width: '100%', marginBottom: 4 }}
            select
            label="Select Event"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            fullWidth
          >
            {events.map((event) => (
              <MenuItem key={event.id} value={event.id}>
                {event.name}
              </MenuItem>
            ))}
          </TextField>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{
              display: 'block', // Ensure the input is displayed as a block element
              margin: '0 auto',
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CreateEvent;
