import { Box, Button, HStack, VStack, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

const UserMenuBar = () => {
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
          <Button as={NavLink} to="/user/calendar" colorScheme="teal">
            Calendar
          </Button>
          <Button as={NavLink} to="/user/client" colorScheme="teal">
            Client
          </Button>
          <Button as={NavLink} to="/user/notes" colorScheme="teal">
            Notes
          </Button>
          <Button as={NavLink} to="/user/notifications" colorScheme="teal">
            Notifications
          </Button>
          <Button as={NavLink} to="/user/profile" colorScheme="teal">
            Profile
          </Button>
          <Button as={NavLink} to="/user/reports" colorScheme="teal">
            Reports
          </Button>
          <Button as={NavLink} to="/logout" colorScheme="teal">
            Logout
          </Button>
          <Button as={NavLink} to="/user/routes" colorScheme="teal">
            Routes
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default UserMenuBar;

