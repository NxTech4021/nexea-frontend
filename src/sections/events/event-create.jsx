/* eslint-disable import/no-unresolved */
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Form, Field, Formik, ErrorMessage } from 'formik';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Grid, Button, Dialog, MenuItem, Container, TextField, DialogTitle, DialogContent} from '@mui/material';

import { paths } from 'src/routes/paths';

// import { useResponsive } from 'src/hooks/use-responsive';

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
      const response = await axios.get('http://localhost:3001/api/event/events');
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
        const response = await fetch('http://localhost:3001/users');
        const data = await response.json();
        setUsers(data);
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
       const response = await axios.post('http://localhost:3001/api/attendee/upload', formData);

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
   
    //    if (response.data.success) {
    //      toast.success('CSV uploaded successfully!');
    //      handleCloseModal(); 
    //    } else {
    //      toast.error('Error uploading CSV.');
    //    }
    // } catch (error) {
    //    console.error('Error uploading CSV:', error);
    //    toast.error('Error uploading CSV. Please try again.');
    // }
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
      {/* <Stack spacing={3}>
        {renderInfo}
        {renderUploadCSV}
      </Stack> */}

    <div>
      <h2>Create Event</h2>
      <Formik
        initialValues={{
          name: '',
          description: '',
          date: new Date(),
          personInCharge: '',
          tickera_api: ''
        }}
        validate={values => {
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
             const response = await axios.post('http://localhost:3001/api/event/create', eventData);
         
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
        {({ isSubmitting, setFieldValue , values}) => (
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
                    users.map(user => (
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
                 onChange={date => setFieldValue('date', date)}
                 className="form-control"              
              />
              </LocalizationProvider>
                <ErrorMessage name="date" component="div" />
              </Grid>
            
              <Grid item xs={6}>
                <Field
                  as={TextField}
                  type="text"
                  name="api"
                  label="Tickera API"
                  fullWidth
                  required
                />
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
  
    <ToastContainer /> {/* Add this to display toast notifications */}
    <Dialog open={openModal} onClose={handleCloseModal}
     sx={{
      '& .MuiDialog-paper': {
        width: '50%', 
        maxWidth: '500px', 
        height: '50%', 
        maxHeight: '300px', 
        overflow: 'auto', 
      },
   }}>
    <DialogTitle 
    sx={{
      display: 'flex',
      justifyContent: 'center', 
      alignItems: 'center', 
      textAlign: 'center', 
    }}>
      Upload Csv </DialogTitle>
        <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '5px', 
        }}
        > 
     <TextField
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
      {/* <Button> Upload </Button> */}
        </DialogContent>
      </Dialog>

    </Container>
  );
};

export default CreateEvent;
