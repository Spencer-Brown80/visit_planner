import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react";

const UpdateEventModal = ({ isOpen, onClose, onProceed, onChangeUpdateSeries }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Button onClick={() => onProceed(false)}>Update Event</Button>
          <Button onClick={() => onProceed(true)}>Update Series</Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UpdateEventModal;
