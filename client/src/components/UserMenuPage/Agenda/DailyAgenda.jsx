import React, { useEffect, useState } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DailyAgenda = ({ userId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/events?date=${selectedDate.toISOString().split('T')[0]}`);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [selectedDate, userId]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">Daily Agenda</Text>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
        />
      </Box>
      <Table variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            <Th>Time</Th>
            <Th>Client Name</Th>
            <Th>Address</Th>
            <Th>Type</Th>
            <Th>Notes</Th>
          </Tr>
        </Thead>
        <Tbody>
          {events.map(event => (
            <Tr key={event.id}>
              <Td>{`${new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</Td>
              <Td>
                <Button variant="link" onClick={() => navigate(`/usermenu/${userId}/events/${event.id}`)}>
                  {event.client_name}
                </Button>
              </Td>
              <Td>
                <Button
                  variant="link"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=YOUR_ADDRESS&destination=${event.address},${event.city},${event.state},${event.zip}`, '_blank')}
                >
                  {`${event.address}, ${event.city}, ${event.state}, ${event.zip}`}
                </Button>
              </Td>
              <Td>{event.type}</Td>
              <Td>{event.notes.slice(0, 20)}{event.notes.length > 20 && '...'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default DailyAgenda;
