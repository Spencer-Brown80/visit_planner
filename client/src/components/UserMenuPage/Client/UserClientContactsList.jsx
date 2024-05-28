import React, { useEffect, useState } from 'react';
import { Box, HStack, Button, Table, Thead, Tbody, Tr, Th, Td, Text, Center, useDisclosure } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import UserClientContactForm from '/src/components/UserMenuPage/Client/UserClientContactForm';

const CONTACT_TYPE_MAP = {
  1: "POA",
  2: "Family",
  3: "Friend",
  4: "Medical"
};

const UserClientContactsList = () => {
  const { id: userId, clientId } = useParams();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const fetchContacts = () => {
    fetch(`/api/user_clients/${clientId}/user_client_contacts`)
      .then(response => response.json())
      .then(data => setContacts(data))
      .catch(error => console.error('Error fetching contacts:', error));
  };

  useEffect(() => {
    fetchContacts();
  }, [clientId]);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    onOpen();
  };

  return (
    <Box mt="120px" p={4} borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <HStack spacing={2} align="stretch" justify="center" padding="20px">
        <Button colorScheme="teal" onClick={() => navigate(`/usermenu/${userId}/clients/${clientId}/profile`)}>
          Return to Profile
        </Button>
        <Button colorScheme="teal" onClick={() => {
          setSelectedContact(null);
          onOpen();
        }}>
          Add New Contact
        </Button>
      </HStack>
      <Center>
        <Text fontSize="2xl" fontWeight="bold">Client Contacts</Text>
      </Center>
      <Table mt={4} variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
            <Th>Type</Th>
            <Th>Notified</Th>
          </Tr>
        </Thead>
        <Tbody>
          {contacts.map(contact => (
            <Tr key={contact.id}>
              <Td>
                <Button variant="link" onClick={() => handleSelectContact(contact)}>
                  {contact.name}
                </Button>
              </Td>
              <Td>{contact.phone}</Td>
              <Td>{contact.email}</Td>
              <Td>{CONTACT_TYPE_MAP[contact.type]}</Td>
              <Td>{contact.is_notified ? "Yes" : "No"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {isOpen && (
        <UserClientContactForm
          isOpen={isOpen}
          onClose={onClose}
          contact={selectedContact}
          clientId={clientId}
          userId={userId}
          onFormSubmit={fetchContacts}
        />
      )}
    </Box>
  );
};

export default UserClientContactsList;