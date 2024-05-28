import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Stack,
  Box
} from "@chakra-ui/react";

const ConflictModal = ({ isOpen, onClose, conflicts = [], onProceed }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Event Conflict</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>There are conflicts with the following events:</Text>
          <Stack spacing={3} mt={4}>
            {conflicts.length > 0 ? (
              conflicts.map(conflict => (
                <Box key={conflict.id} p={4} borderWidth={1} borderRadius="md">
                  {conflict.title}
                </Box>
              ))
            ) : (
              <Text>No conflicts found.</Text>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onProceed}>Proceed Anyway</Button>
          <Button variant="ghost" ml={3} onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConflictModal;
