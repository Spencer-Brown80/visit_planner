import { Box, Button, HStack, VStack, Text } from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
import LogoutForm from '/src/components/UserMenuPage/Logout/LogoutForm'; // Adjust the path as necessary

const UserMenuBar = () => {
  const location = useLocation();

  const navButtonStyles = {
    default: {
      borderRadius: "0",
      borderBottom: "2px solid transparent",
      _hover: {
        bg: "lightgray",
        borderBottom: "2px solid teal",
      },
    },
    active: {
      bg: "#23b88d", // teal
      color: "#FFFFFF", // white
      borderRadius: "0",
      borderBottom: "2px solid #00008B", // darkblue
    },
  };

  const getButtonStyle = (path) =>
    location.pathname.includes(path) ? navButtonStyles.active : navButtonStyles.default;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100px" // Adjust height as needed
      bg="#3e195e"
      boxShadow="lg"
      zIndex="999" // Ensure it sits in front of other components
    >
      <VStack justifyContent="space-between" height="100%">
        <Text
          fontSize="40px"
          fontFamily="'Dancing Script', cursive" // Use Dancing Script font
          color="#6f4a94" // Apply selected color
          fontWeight="bold"
          letterSpacing="2px"
          textShadow="2px 4px 6px rgba(0, 0, 0, .75)"
          mt={2}
        >
          VisitMe
        </Text>
        <HStack justifyContent="flex-start" spacing={4} height="50%">
          <Button as={NavLink} to="calendar" {...getButtonStyle("/calendar")}>
            Calendar
          </Button>
          <Button as={NavLink} to="clients" {...getButtonStyle("/clients")}>
            Clients
          </Button>
          <Button as={NavLink} to="notes" {...getButtonStyle("/notes")}>
            Notes
          </Button>
          <Button as={NavLink} to="notifications" {...getButtonStyle("/notifications")}>
            Notifications
          </Button>
          <Button as={NavLink} to="profile" {...getButtonStyle("/profile")}>
            Profile
          </Button>
          <Button as={NavLink} to="reports" {...getButtonStyle("/reports")}>
            Reports
          </Button>
          <Button as={NavLink} to="agenda" {...getButtonStyle("/agenda")}>
            Agenda
          </Button>
          <LogoutForm buttonStyle={navButtonStyles}/>
        </HStack>
      </VStack>
    </Box>
  );
};

export default UserMenuBar;
