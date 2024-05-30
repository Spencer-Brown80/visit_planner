import React, { useEffect, useState } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Text, Button, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import EventForm from '/src/components/EventForm'; // Ensure this path is correct

const EVENT_TYPE_MAP = {
  1: "Client Visit",
  2: "Personal Event",
  3: "Client Unavailable",
};

const DailyAgenda = ({ userId, selectedDate, onDateChange, onPreviousDay, onNextDay }) => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/events?date=${selectedDate.toISOString().split('T')[0]}`);
        let eventsData = await response.json();

        // Filter out type 3 events
        eventsData = eventsData.filter(event => event.type !== 3);

        // Fetch client details for each event
        const clientDetails = await Promise.all(eventsData.map(async (event) => {
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

        setEvents(clientDetails);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [selectedDate, userId]);

  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Button colorScheme="blue" onClick={() => handleOpenModal(null)}>
          Add Event
        </Button>
        <Text fontSize="2xl" fontWeight="bold">Daily Agenda</Text>
        <Flex alignItems="center">
          <Button onClick={onPreviousDay}>Previous</Button>
          <DatePicker
            selected={selectedDate}
            onChange={onDateChange}
            dateFormat="yyyy-MM-dd"
            customInput={<Button>{format(selectedDate, 'yyyy-MM-dd')}</Button>}
          />
          <Button onClick={onNextDay}>Next</Button>
        </Flex>
      </Flex>
      <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={4}>
        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
      </Text>
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
              <Td>
                <Button variant="link" onClick={() => handleOpenModal(event)}>
                  {`${new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </Button>
              </Td>
              <Td>
                <Button variant="link" onClick={() => navigate(`/usermenu/${userId}/clients/${event.user_client_id}`)}>
                  {event.client_name}
                </Button>
              </Td>
              <Td>
                <Button
                  variant="link"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.address || `${event.client_address}, ${event.client_city}, ${event.client_state}, ${event.client_zip}`}`, '_blank')}
                >
                  {event.address || `${event.client_address}, ${event.client_city}, ${event.client_state}, ${event.client_zip}`}
                </Button>
              </Td>
              <Td>{EVENT_TYPE_MAP[event.type]}</Td>
              <Td>{event.notes.slice(0, 20)}{event.notes.length > 20 && '...'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedEvent ? 'Edit Event' : 'Add Event'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <EventForm
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              event={selectedEvent}
              onSubmit={() => {
                handleCloseModal();
                // Refresh the events after submission
                fetchEvents();
              }}
              userId={userId}
              clients={[]} // Pass the list of clients if available
              events={events}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DailyAgenda;
