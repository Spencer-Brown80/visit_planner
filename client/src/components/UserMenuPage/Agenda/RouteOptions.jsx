import React from 'react';
import { Box, Button } from '@chakra-ui/react';

const RouteOptions = ({ addresses, userAddress }) => {
  const generateRoute = () => {
    console.log('Addresses:', addresses); // Log addresses to debug

    const addressList = [userAddress, ...addresses];
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(addressList[0])}&destination=${encodeURIComponent(addressList[addressList.length - 1])}&waypoints=${addressList.slice(1, -1).map(addr => encodeURIComponent(addr)).join('|')}`;

    window.open(mapsUrl, '_blank');
  };

  return (
    <Box>
      <Button colorScheme="blue" onClick={generateRoute}>
        Generate Route
      </Button>
    </Box>
  );
};

export default RouteOptions;
