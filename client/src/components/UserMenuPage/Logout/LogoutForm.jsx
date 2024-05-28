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
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';

const LogoutForm = ({ buttonStyle }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Perform logout logic here
    // For example, clear user session, etc.
    navigate('/');
  };

  const getButtonStyle = () => {
    return location.pathname.includes('/logout') ? buttonStyle.active : buttonStyle.default;
  };

  return (
    <>
      <Button onClick={onOpen} {...getButtonStyle()}>
        Logout
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xs">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Logout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to log out?
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleLogout}>
              Yes
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LogoutForm;
