import React from "react";
import { Box, Center } from "@chakra-ui/react";
import UserMenuBar from "../components/UserMenuPage/UserMenuBar";

const UserMenuPage = () => {
  return (
    <Box>
      <UserMenuBar />
      <Box mt="120px"> {/* Add top margin to avoid overlap with UserMenuBar */}
        {/* Add your routes and content here */}
      </Box>
    </Box>
  );
};

export default UserMenuPage;

