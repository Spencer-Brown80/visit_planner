import React from "react";
import { Box, Text, Center } from "@chakra-ui/react";

const AboutComp = () => {
  return (
    <Center height="100vh">
      <Box textAlign="center">
        <Text fontSize="xl" mb={4}>
          About VisitMe
        </Text>
        <Text>
          VisitMe is designed to help you manage your visits and appointments efficiently. Learn more about our features and how we can help you stay organized.
        </Text>
      </Box>
    </Center>
  );
};

export default AboutComp;
