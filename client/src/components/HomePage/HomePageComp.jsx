import React from "react";
import { Box, Text, Center } from "@chakra-ui/react";

const HomePageComp = () => {
  return (
    <Center height="100vh">
      <Box textAlign="center">
        <Text fontSize="xl" mb={4}>
          Welcome to VisitMe, your go-to app for managing your visits and appointments!
        </Text>
        <Text>
          Here, you can keep track of all your client interactions, schedules, and more. Please log in or register to continue.
        </Text>
      </Box>
    </Center>
  );
};

export default HomePageComp;


