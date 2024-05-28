import React, { useState, useEffect } from 'react';
import { Box, Input, Button, VStack, Text } from '@chakra-ui/react';
import UserNotesForm from './UserNotesForm';
import { format } from 'date-fns';
import { useParams, useNavigate } from "react-router-dom";


const UserNotesList = () => {
  const { id } = useParams();

  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${id}/user_notes`)
      .then(response => response.json())
      .then(data => setNotes(data.sort((a, b) => new Date(b.date_created) - new Date(a.date_created))))
      .catch(error => console.error("Error fetching notes:", error));
  }, [id]);

  useEffect(() => {
    setFilteredNotes(
      notes.filter(note => note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, notes]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setIsFormOpen(true);
  };

  const handleAddNote = () => {
    setSelectedNote(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (updatedNote) => {
    if (updatedNote.id) {
      setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
    } else {
      setNotes([updatedNote, ...notes]);
    }
    setIsFormOpen(false);
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" fontWeight="bold">Notes</Text>
      <Input
        placeholder="Search notes..."
        value={searchTerm}
        onChange={handleSearchChange}
        mb={4}
      />
      <Button onClick={handleAddNote} colorScheme="teal" mb={4}>Add Note</Button>
      <VStack align="stretch" spacing={4}>
        {filteredNotes.map(note => (
          <Box
            key={note.id}
            p={4}
            shadow="md"
            borderWidth="1px"
            cursor="pointer"
            onClick={() => handleSelectNote(note)}
          >
            <Text fontSize="lg">{note.content}</Text>
            <Text fontSize="sm" color="gray.500">{format(new Date(note.date_created), 'PPpp')}</Text>
          </Box>
        ))}
      </VStack>
      {isFormOpen && (
        <UserNotesForm
          note={selectedNote}
          userId={id}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </Box>
  );
};

export default UserNotesList;

