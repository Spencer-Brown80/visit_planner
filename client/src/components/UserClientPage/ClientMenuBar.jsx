import { Box, Button, HStack, VStack, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import LogoutForm from '/src/components/UserMenuPage/Logout/LogoutForm'; // Adjust the path as necessary

const ClientMenuBar = () => {
  return (
    <Box
      position="fixed"
      top="20px" // Offset from the top of the page
      left="0"
      width="100%"
      height="100px" // Adjust height as needed
      bg="LightBlue"
      boxShadow="lg"
      p={4}
    >
      <VStack justifyContent="space-between" height="100%">
        <Text
          fontSize="40px"
          fontFamily="Boogaloo"
          fontWeight="bold"
          letterSpacing="2px"
          textShadow="2px 4px 6px rgba(0, 0, 0, .75)"
        >
          VisitMe
        </Text>
        <HStack justifyContent="flex-start" spacing={4}>
          <Button as={NavLink} to="user_client_calendar" colorScheme="teal">
            Calendar
          </Button>
          <Button as={NavLink} to="user_client" colorScheme="teal">
            Profile
          </Button>
          <Button as={NavLink} to="user_client_notes" colorScheme="teal">
            Notes
          </Button>
          <Button as={NavLink} to="user_client_contacts" colorScheme="teal">
            Contacts
          </Button>
          
          
          <LogoutForm />
        </HStack>
      </VStack>
    </Box>
  );
};

export default ClientMenuBar;
