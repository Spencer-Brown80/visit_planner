import React, { useState, useEffect } from 'react';
import { Box, Button, VStack } from '@chakra-ui/react';
import TravelParamsComponent from '/src/components/UserMenuPage/Agenda/TravelParamsComponent';
import TempParamsComponent from '/src/components/UserMenuPage/Agenda/TempParamsComponent';
import RouteOptions from '/src/components/UserMenuPage/Agenda/RouteOptions';
import DailyAgenda from '/src/components/UserMenuPage/Agenda/DailyAgenda';
import { useParams } from 'react-router-dom';

const UserAgendaContainer = () => {
  const { id: userId } = useParams();
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day
    return today;
  });
  const [events, setEvents] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/events?date=${selectedDate.toISOString().split('T')[0]}`);
        let eventsData = await response.json();

        // Filter out type 3 events and fetch client details for each event
        eventsData = eventsData.filter(event => event.type !== 3);
        const detailedEvents = await Promise.all(eventsData.map(async (event) => {
          const clientResponse = await fetch(`/api/user_clients/${event.user_client_id}`);
          const clientData = await clientResponse.json();
          return {
            ...event,
            client_address: clientData.address_line_1,
            client_city: clientData.city,
            client_state: clientData.state,
            client_zip: clientData.zip,
          };
        }));

        const addresses = detailedEvents.map(event => event.address || `${event.client_address}, ${event.client_city}, ${event.client_state}, ${event.client_zip}`);
        setEvents(detailedEvents);
        setAddresses(addresses);
        console.log('Addresses:', addresses); // Log addresses
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/profile`);
        const userProfile = await response.json();
        setUserAddress(`${userProfile.address}, ${userProfile.city}, ${userProfile.state}, ${userProfile.zip}`);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchEvents();
    fetchUserProfile();
  }, [selectedDate, userId]);

  const handleDateChange = (date) => {
    const adjustedDate = new Date(date);
    adjustedDate.setHours(0, 0, 0, 0); // Set to start of the day
    setSelectedDate(adjustedDate);
  };

  const handlePreviousDay = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  const toggleComponent = (component) => {
    setSelectedComponent(prevComponent => (prevComponent === component ? null : component));
  };

  return (
    <Box mt="120px" p={4} borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <VStack spacing={4} align="stretch">
        <Button colorScheme="teal" width="100%" onClick={() => toggleComponent('preferences')}>
          My Preferences
        </Button>
        <Button colorScheme="teal" width="100%" onClick={() => toggleComponent('options')}>
          Today's Options
        </Button>
        <Button colorScheme="teal" width="100%" onClick={() => toggleComponent('routeOptions')}>
          Route Options
        </Button>
        <Button colorScheme="teal" width="100%" onClick={() => setSelectedComponent(null)}>
          Agenda
        </Button>
      </VStack>
      <Box mt={4}>
        {selectedComponent === 'preferences' && <TravelParamsComponent userId={userId} />}
        {selectedComponent === 'options' && <TempParamsComponent userId={userId} />}
        {selectedComponent === 'routeOptions' && <RouteOptions userId={userId} addresses={addresses} userAddress={userAddress} />}
      </Box>
      <Box mt={4}>
        <DailyAgenda userId={userId} selectedDate={selectedDate} onDateChange={handleDateChange} onPreviousDay={handlePreviousDay} onNextDay={handleNextDay} />
      </Box>
    </Box>
  );
};

export default UserAgendaContainer;
