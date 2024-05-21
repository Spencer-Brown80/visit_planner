import { Box, Button, Flex, Spacer } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const NavBar = ({ onShowHome, onShowLogin, onShowAbout }) => {
  const navigate = useNavigate();

  return (
    <Flex bg="lightblue" p={4} shadow="md" position="fixed" width="100%" zIndex="1">
      <Box fontSize="40px" fontFamily="Boogaloo" fontWeight="bold" letterSpacing="2px" textShadow="2px 4px 6px rgba(0, 0, 0, .75)">
        VisitMe
      </Box>
      <Spacer />
      <Button colorScheme="teal" mr="4" onClick={onShowHome}>
        Home
      </Button>
      <Button colorScheme="teal" mr="4" onClick={onShowAbout}>
        About
      </Button>
      <Button colorScheme="teal" mr="4" onClick={onShowLogin}>
        Log In / Register
      </Button>
    </Flex>
  );
};

export default NavBar;






