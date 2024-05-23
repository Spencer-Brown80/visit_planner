import React, { useEffect, useState } from 'react';
import { Box, Center, Text, Table, Thead, Tbody, Tr, Th, Td, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const UserClientList = () => {
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/user_clients")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched clients data:", data); // Debugging line
        setClients(data);
      })
      .catch((error) => console.error("Error fetching clients:", error));
  }, []);

  return (
    <Box mt="120px" p={4} borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Center>
        <Text fontSize="2xl" fontWeight="bold">User Client List</Text>
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
          {clients.map((user_client) => (
            <Tr key={user_client.id}>
              <Td>
                <Button variant="link" onClick={() => navigate(`/user/clients/${user_client.id}`)}>
                  {user_client.first_name}   { user_client.last_name }
                </Button>
              </Td>
              <Td>{`${user_client.address_line_1} ${user_client.address_line_2 || ''}, ${user_client.city}, ${user_client.state}, ${user_client.zip}`}</Td>
              <Td>{user_client.phone}</Td>
              <Td>{user_client.email}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default UserClientList;


