import React, { useEffect, useState } from 'react';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, Text, Center } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';

const UserClientList = () => {
  const { id: userId } = useParams();

  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/user_clients`)
      .then(response => response.json())
      .then(data => setClients(data))
      .catch(error => console.error('Error fetching clients:', error));
  }, []);

  return (
    <Box mt="120px" p={4} borderWidth="1px" borderRadius="lg" boxShadow="lg">
      
      <Button colorScheme="teal" padding="20px" onClick={() => navigate(`/usermenu/${userId}/clients/new`)}>
        Add New Client
      </Button>
      
      <Center>
        <Text fontSize="2xl" fontWeight="bold">Client List</Text>
      </Center>
      
      <Table mt={4} variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            <Th>Client Name</Th>
            <Th>Address</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
          </Tr>
        </Thead>
        <Tbody>
          {clients.map(client => (
            <Tr key={client.id}>
              <Td>
                <Button variant="link" onClick={() => navigate(`/usermenu/${userId}/clients/${client.id}/profile`)}>
                  {client.first_name} {client.last_name}
                </Button>
              </Td>
              <Td>
                <Button
                  variant="link"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${client.address_line_1},${client.city},${client.state},${client.zip}`, '_blank')}
                >
                  {`${client.address_line_1} ${client.address_line_2 || ''}, ${client.city}, ${client.state}, ${client.zip}`}
                </Button>
              </Td>
              <Td>{client.phone}</Td>
              <Td>{client.email}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default UserClientList;




