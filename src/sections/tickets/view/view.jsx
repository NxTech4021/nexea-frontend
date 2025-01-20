import { enqueueSnackbar } from 'notistack';
import React, { useMemo, useEffect, useCallback } from 'react';

import { Box, Grid, Stack, Typography, CircularProgress } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { getCookie } from 'src/utils/get-cookie';
import axiosInstance, { endpoints } from 'src/utils/axios';

import { useGetCart } from 'src/api/cart/cart';


import { Box, Grid, Stack, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText } from '@mui/material';


import TickerPurchaseHeader from '../header';
import { Cart } from '../context/ticket-context';
import TicketSelectionCard from '../ticket-selection-card';


const TicketPurchaseView = () => {
  const searchParams = new URLSearchParams(window.location.search);
  localStorage.setItem('eventId', searchParams.get('eventId'));
  localStorage.setItem('ticketTypeId', searchParams.get('ticketTypeId'));

  const ticketTypeId = localStorage.getItem('ticketTypeId');
  const eventId = localStorage.getItem('eventId');

  // get cartSessionId from browser cookie set by the server
  const cartSessionId = getCookie();

  const { data, isLoading, mutate, error } = useGetCart(cartSessionId, eventId, ticketTypeId);

  const loading = useBoolean();

  const createNewSession = useCallback(async () => {
    loading.onTrue();
    try {
      return await axiosInstance.post(endpoints.cart.createSession, {
        ticketTypeId,
        eventId,
      });
    } catch (err) {
      return enqueueSnackbar('Error creating session', {
        variant: 'error',
      });
    } finally {
      loading.onFalse();
    }
  }, [ticketTypeId, eventId, loading]);

  useEffect(() => {
    if (!cartSessionId) {
      createNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSessionId]);

  const memoizedValue = useMemo(
    () => ({
      ticketTypeId,
      eventId,
      cartSessionId,
      data,
      mutate,
    }),
    [ticketTypeId, eventId, cartSessionId, data, mutate]
  );

  if (loading.value || isLoading) {
    return (
      <Box
        sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <CircularProgress
          thickness={7}
          size={25}
          sx={{
            color: (theme) => theme.palette.common.black,
            strokeLinecap: 'round',
          }}
        />
      </Box>
    );
  }

  if (!isLoading && error) {
    return (
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        Session ID not found in database.
      </Typography>
    );
  }

  return (
    <Cart.Provider value={memoizedValue}>
      <TickerPurchaseHeader />
      {!isLoading && !data && <Typography sx={{ textAlign: 'center' }}>No data found.</Typography>}
      <Box px={{ xs: 2, md: 15 }} bgcolor="#F4F4F4" minHeight="100vh" overflow="hidden" pt={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Stack spacing={5} sx={{ gridColumn: { md: 'span 2' } }}>
              <TicketSelectionCard />

              {/* <TicketInformationCard /> */}
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            {/* <TicketPaymentCard /> */}
          </Grid>
        </Grid>
      </Box>
    </Cart.Provider>
  );
};
// =======
// import TicketInformationCard from '../ticket-information-card';

// const TicketPurchaseView = () => {
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await axiosInstance.get(endpoints.events.list); 
       
//         if (response.data && Array.isArray(response.data.events)) {
//           setEvents(response.data.events); 
//         } else {
//           console.error('Unexpected response format:', response);
//           setEvents([]); 
//         }
//       } catch (error) {
//         console.error('Error fetching events:', error);
//       }
//     };

//     fetchEvents();
//   }, []);

//   const handleEventSelection = async (eventId) => {
//     try {
//       const response = await axiosInstance.get(endpoints.events.detail(eventId));
//       const eventData = response.data;
//       console.log("data", eventData)
//       setSelectedEvent(eventData);
//     } catch (error) {
//       console.error('Error fetching event details:', error);
//     }
//   };

  
//   console.log("selected", selectedEvent)
//   return (
//     <>
//       <TickerPurchaseHeader />
//     <Box px={{ xs: 2, md: 15 }} bgcolor="#F4F4F4" minHeight="100vh" overflow="hidden" pt={12}>
//       <Grid container spacing={2}>
//         <Grid item xs={12} md={8}>
//         <h2>Select an Event</h2>
//             {events.map((event) => (
//               <Button
//                 key={event.id}
//                 variant="contained"
//                 color="primary"
//                 onClick={() => handleEventSelection(event.id)}
//                 sx={{ mb: 2 }}
//               >
//                 {event.name}
//               </Button>
//             ))}
//             {selectedEvent && (
//               <Stack spacing={5} sx={{ gridColumn: { md: 'span 2' } }}>
//                 <TicketSelectionCard  eventData={selectedEvent}/>
//                 <TicketInformationCard eventId={selectedEvent.id} />
//               </Stack>
//             )}
//         </Grid>
//         <Grid item xs={12} md={4}>
//           <TicketPaymentCard />
//         </Grid>
//       </Grid>
//     </Box>
//     </>
//   );
// };


export default TicketPurchaseView;
