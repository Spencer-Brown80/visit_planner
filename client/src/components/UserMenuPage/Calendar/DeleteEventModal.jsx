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
  RadioGroup,
  Stack,
  Radio
} from "@chakra-ui/react";

const DeleteEventModal = ({ isOpen, onClose, onProceed, onChangeUpdateSeries }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Do you want to delete this event or the entire series?</Text>
          <RadioGroup onChange={onChangeUpdateSeries} mt={4}>
            <Stack direction="row">
              <Radio value={false}>This Event Only</Radio>
              <Radio value={true}>Entire Series</Radio>
            </Stack>
          </RadioGroup>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" onClick={onProceed}>Delete</Button>
          <Button variant="ghost" ml={3} onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteEventModal;
