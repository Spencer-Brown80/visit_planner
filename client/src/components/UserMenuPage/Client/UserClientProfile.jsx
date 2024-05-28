import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, HStack, VStack, Center, Text, Switch } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';

const UserClientProfile = () => {
  const { id: userId, clientId } = useParams();
  const [client, setClient] = useState({
    first_name: '',
    last_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    geolocation: '',
    geolocation_distance: 0,
    address_notes: '',
    is_notified: false,
    notify_contact: false,
    notification_period: 0
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    if (clientId) {
      fetch(`/api/user_clients/${clientId}`)
        .then(response => response.json())
        .then(data => setClient(data))
        .catch(error => console.error('Error fetching client:', error));
    }
  }, [clientId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClient({
      ...client,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async () => {
    const method = clientId ? 'PATCH' : 'POST';
    const url = clientId ? `/api/user_clients/${clientId}` : `/api/user_clients`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (!clientId) {
        navigate(`/usermenu/${userId}/clients/${data.id}/profile`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Box mt="120px" p={4} borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <HStack spacing={2} align="stretch" justify="center" padding="20px">
        
        <Button colorScheme="teal" onClick={() => navigate(`/usermenu/${userId}/clients`)}>
          Return to Client List
        </Button>
        <Button colorScheme="teal" onClick={() => navigate(`/usermenu/${userId}/clients/${clientId}/notes`)}>
          Notes
        </Button>
        <Button colorScheme="teal" onClick={() => navigate(`/usermenu/${userId}/clients/${clientId}/contacts`)}>
          Contacts
        </Button>
      </HStack>
      <VStack>
      <Center>
          <Text fontSize="2xl" fontWeight="bold">{clientId ? 'Client Profile' : 'Add New Client'}</Text>
        </Center>
        <FormControl>
          <FormLabel>First Name</FormLabel>
          <Input name="first_name" value={client.first_name} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Last Name</FormLabel>
          <Input name="last_name" value={client.last_name} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Address Line 1</FormLabel>
          <Input name="address_line_1" value={client.address_line_1} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Address Line 2</FormLabel>
          <Input name="address_line_2" value={client.address_line_2} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>City</FormLabel>
          <Input name="city" value={client.city} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>State</FormLabel>
          <Input name="state" value={client.state} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>ZIP</FormLabel>
          <Input name="zip" value={client.zip} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Phone</FormLabel>
          <Input name="phone" value={client.phone} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input name="email" value={client.email} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Geolocation</FormLabel>
          <Input name="geolocation" value={client.geolocation} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Geolocation Distance</FormLabel>
          <Input name="geolocation_distance" type="number" value={client.geolocation_distance} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Address Notes</FormLabel>
          <Input name="address_notes" value={client.address_notes} onChange={handleChange} />
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Is Notified</FormLabel>
          <Switch name="is_notified" isChecked={client.is_notified} onChange={handleChange} />
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Notify Contact</FormLabel>
          <Switch name="notify_contact" isChecked={client.notify_contact} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Notification Period</FormLabel>
          <Input name="notification_period" type="number" value={client.notification_period} onChange={handleChange} />
        </FormControl>
        <Button colorScheme="teal" onClick={handleSubmit}>
          {clientId ? 'Update' : 'Create'}
        </Button>
      </VStack>
    </Box>
  );
};

export default UserClientProfile;
