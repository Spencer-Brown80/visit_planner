import { Box, Center } from "@chakra-ui/react";
import HomePageComp from "../components/HomePage/HomePageComp";
import LoginForm from "../components/HomePage/LoginForm";
import RegistrationForm from "../components/HomePage/RegistrationForm";
import AboutComp from "../components/HomePage/AboutComp";

const HomePage = ({ showLogin, showRegister, showAbout, handleShowLogin, handleShowRegister }) => {
  return (
    <Center height="100vh"> {/* Center the content vertically and horizontally */}
      <Box width="100%" maxW="600px" p={4} boxShadow="lg" borderRadius="md">
        {!showLogin && !showRegister && !showAbout && <HomePageComp />}
        {showLogin && <LoginForm onShowRegister={handleShowRegister} />}
        {showRegister && <RegistrationForm onShowLogin={handleShowLogin} />}
        {showAbout && <AboutComp />}
      </Box>
    </Center>
  );
};

export default HomePage;



