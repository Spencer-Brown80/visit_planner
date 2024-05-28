import React, { useState } from 'react';
import { Box, Button, VStack, Text } from '@chakra-ui/react';
import TravelParamsComponent from '/src/components/UserMenuPage/Agenda/TravelParamsComponent';
import TempParamsComponent from '/src/components/UserMenuPage/Agenda/TempParamsComponent';
import RouteOptions from '/src/components/UserMenuPage/Agenda/RouteOptions';
import DailyAgenda from '/src/components/UserMenuPage/Agenda/DailyAgenda';
import { useParams } from 'react-router-dom';


const UserAgendaContainer = () => {
    const { id: userId } = useParams();
    const [selectedComponent, setSelectedComponent] = useState(null);
  
    return (
      <Box mt="120px" p={4} borderWidth="1px" borderRadius="lg" boxShadow="lg">
        <VStack spacing={4} align="stretch">
          <Button colorScheme="teal" width="100%" onClick={() => setSelectedComponent('preferences')}>
            My Preferences
          </Button>
          <Button colorScheme="teal" width="100%" onClick={() => setSelectedComponent('options')}>
            Today's Options
          </Button>
          <Button colorScheme="teal" width="100%" onClick={() => setSelectedComponent('routeOptions')}>
            Route Options
          </Button>
        </VStack>
        <Box mt={4}>
          {selectedComponent === 'preferences' && <TravelParamsComponent userId={userId} />}
          {selectedComponent === 'options' && <TempParamsComponent userId={userId} />}
          {selectedComponent === 'routeOptions' && <RouteOptions userId={userId} />}
        </Box>
        <Box mt={4}>
          <DailyAgenda userId={userId} />
        </Box>
      </Box>
    );
  };
  
  export default UserAgendaContainer;