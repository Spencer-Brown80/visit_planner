import React, { useContext } from "react";
import { Box, Center } from "@chakra-ui/react";
import UserMenuBar from "../components/UserMenuPage/UserMenuBar";
import { Outlet } from "react-router-dom";
import { UserContext } from "../UserContext";

const UserMenuPage = () => {
  const { userId } = useContext(UserContext);

  return (
    <Box>
      <UserMenuBar userId={userId} />
      <Box mt="120px"> {/* Add top margin to avoid overlap with UserMenuBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserMenuPage;
