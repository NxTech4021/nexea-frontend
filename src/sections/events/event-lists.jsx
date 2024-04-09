
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

import Pagination, { paginationClasses } from '@mui/material/Pagination';
import { Box, Card, Button, CardHeader, CardActions, CardContent, Typography } from '@mui/material';

const TestCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'visible', // Make sure the overflow is visible to show the blurred image
  borderRadius: 8, // Adjust as per your preference
  boxShadow: 'none', // You can add box-shadow if desired
  backgroundBlendMode: 'overlay',
  backgroundImage: 'url(https://api.slingacademy.com/public/sample-photos/1.jpeg)',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    //  backgroundImage: (props) => `url(${props.backgroundImage}`,
    //  backgroundImage: 'url(https://api.slingacademy.com/public/sample-photos/1.jpeg)',
    filter: 'blur(10px)', // Adjust the blur intensity as needed
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    zIndex: 1111, // Ensure the blurred background stays behind the content
  },
}));

const EventLists = () => {
  //   const setting = useSettingsContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/events/list'); //  change the /api if it doesnt work localhost:3001/api/events/list
      console.log(response.data)
      setEvents(response.data);

    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

    fetchEvents();
 }, []);

 return (
  <>
    <Box
      display="grid"
      gap={3}
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
      }}
      marginTop={5}
    >
       {loading ? (
          <div>Loading...</div>
        ) : (
          events.map((event) => (
            <Card
              sx={{
                width: '100%',
                height: 300,
                backgroundImage: 'url(https://api.slingacademy.com/public/sample-photos/1.jpeg)',
                backgroundBlendMode: 'overlay',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              key={event.id} // Ensure each card has a unique key
            >
              <CardHeader title={event.name} subheader={event.status} />
              <CardContent>
              <Typography> {event.description} <br/> 
                {event.date}
              </Typography> 
               
              <Typography> Person in Charge: {event.personInCharge.name} </Typography>
              {/* {event.personInCharge} */}
                {/* {event.status} */}
              </CardContent>
              <CardActions
                sx={{
                 position: 'absolute',
                 right: 0,
                 bottom: 0,
                }}
              >
                <Button>View Event</Button>
              </CardActions>
            </Card>
          ))
        )}
      </Box>

        {/* <TestCard backgroundImage="https://api.slingacademy.com/public/sample-photos/1.jpeg">
        <CardHeader title="DisruptInvest" subheader="Lorem ipsum dolor sit amet." />
        <CardContent>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, corporis?
        </CardContent>
        <CardActions
          sx={{
            position: 'absolute',
            right: 0,
            bottom: 0,
          }}
        >
          <Button>See more</Button>
        </CardActions>
      </TestCard> 
    </Box> */}
    <Pagination
      count={3}
      sx={{
        mt: 8,
        [`& .${paginationClasses.ul}`]: {
          justifyContent: 'center',
        },
      }}
    />
  </>

  );
};
export default EventLists;

TestCard.propTypes = {
  backgroundImage: PropTypes.string.isRequired,
};
