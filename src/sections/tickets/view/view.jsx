import React, { useState, useEffect }  from 'react';

import { Box, Grid, Stack, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText } from '@mui/material';
import axiosInstance, { endpoints } from 'src/utils/axios';

import TickerPurchaseHeader from '../header';
import TicketPaymentCard from '../ticket-payment-card';
import TicketSelectionCard from '../ticket-selection-card';
import TicketInformationCard from '../ticket-information-card';

const TicketPurchaseView = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get(endpoints.events.list); // Make sure this is correct
        console.log('Fetched events:', response); // Log the entire response to verify the structure
        if (response.data && Array.isArray(response.data.events)) {
          setEvents(response.data.events); // Correctly access the events array inside response.data
        } else {
          console.error('Unexpected response format:', response);
          setEvents([]); // Set empty array if format is unexpected
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleEventSelection = async (eventId) => {
    try {
      const response = await axiosInstance.get(endpoints.events.detail(eventId));
      const eventData = response.data;
      console.log("data", eventData)
      setSelectedEvent(eventData);
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  
  console.log("selected", selectedEvent)
  return (
    <>
      <TickerPurchaseHeader />
    <Box px={{ xs: 2, md: 15 }} bgcolor="#F4F4F4" minHeight="100vh" overflow="hidden" pt={12}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
        <h2>Select an Event</h2>
            {events.map((event) => (
              <Button
                key={event.id}
                variant="contained"
                color="primary"
                onClick={() => handleEventSelection(event.id)}
                sx={{ mb: 2 }}
              >
                {event.name}
              </Button>
            ))}
            {selectedEvent && (
              <Stack spacing={5} sx={{ gridColumn: { md: 'span 2' } }}>
                <TicketSelectionCard  eventData={selectedEvent}/>
                <TicketInformationCard eventId={selectedEvent.id} />
              </Stack>
            )}
          {/* <Stack spacing={5} sx={{ gridColumn: { md: 'span 2' } }}>
            <TicketSelectionCard />

            <TicketInformationCard />
          </Stack> */}
        </Grid>
        <Grid item xs={12} md={4}>
          <TicketPaymentCard />
        </Grid>
      </Grid>
    </Box>
    </>
  );
};
// const TicketPurchaseView = () => (
//   <>
    // <TickerPurchaseHeader />
    // <Box px={{ xs: 2, md: 15 }} bgcolor="#F4F4F4" minHeight="100vh" overflow="hidden" pt={12}>
    //   <Grid container spacing={2}>
    //     <Grid item xs={12} md={8}>
    //       <Stack spacing={5} sx={{ gridColumn: { md: 'span 2' } }}>
    //         <TicketSelectionCard />

    //         <TicketInformationCard />
    //       </Stack>
    //     </Grid>
    //     <Grid item xs={12} md={4}>
    //       <TicketPaymentCard />
    //     </Grid>
    //   </Grid>
    // </Box>
//   </>
// );

export default TicketPurchaseView;
