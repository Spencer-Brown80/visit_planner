import React, { useEffect, useState } from 'react';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, Text, Input, Center, useDisclosure, HStack } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import UserClientNoteForm from '/src/components/UserMenuPage/Client/UserClientNoteForm';

const noteTypes = {
  1: 'General',
  2: 'Schedule'
};

const UserClientNotesList = () => {
  const { id: userId, clientId } = useParams();
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const fetchNotes = () => {
    fetch(`/api/user_clients/${clientId}/user_client_notes`)
      .then(response => response.json())
      .then(data => setNotes(data))
      .catch(error => console.error('Error fetching notes:', error));
  };

  useEffect(() => {
    fetchNotes();
  }, [clientId]);

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    onOpen();
  };

  return (
    <Box mt="120px" p={4} borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <HStack spacing={2} align="stretch" justify="center" padding="20px">
        <Button colorScheme="teal" onClick={() => navigate(`/usermenu/${userId}/clients/${clientId}/profile`)}>
          Return to Profile
        </Button>
        <Button colorScheme="teal" onClick={() => {
          setSelectedNote(null);
          onOpen();
        }}>
          Add New Note
        </Button>
      </HStack>
      <Center>
        <Text fontSize="2xl" fontWeight="bold">Client Notes</Text>
      </Center>
      <Input
        placeholder="Search notes"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mt={4}
      />
      <Table mt={4} variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            <Th>Content</Th>
            <Th>Type</Th>
            <Th>Date Created</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredNotes.map(note => (
            <Tr key={note.id}>
              <Td>
                <Button variant="link" onClick={() => handleSelectNote(note)}>
                  {note.content}
                </Button>
              </Td>
              <Td>{noteTypes[note.type]}</Td>
              <Td>{new Date(note.date_created).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {isOpen && (
        <UserClientNoteForm
          isOpen={isOpen}
          onClose={onClose}
          note={selectedNote}
          clientId={clientId}
          userId={userId}
          onFormSubmit={fetchNotes}
        />
      )}
    </Box>
  );
};

export default UserClientNotesList;
