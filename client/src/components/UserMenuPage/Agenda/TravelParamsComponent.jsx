import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Switch, VStack } from '@chakra-ui/react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

const TravelParamsComponent = ({ userId }) => {
  const [travelParams, setTravelParams] = useState(null);

  useEffect(() => {
    const fetchTravelParams = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/user_parameters`);
        const data = await response.json();
        setTravelParams(data);
      } catch (error) {
        console.error('Error fetching travel params:', error);
      }
    };

    fetchTravelParams();
  }, [userId]);

  const initialValues = travelParams || {
    day_of_week: '',
    start_time: '',
    is_start_mandatory: false,
    end_time: '',
    is_end_mandatory: false,
    is_endpoint: false,
    endpoint_address: '',
    endpoint_city: '',
    endpoint_state: '',
    endpoint_zip: '',
    is_shortest: false,
    is_quickest: false,
    is_highways: false,
    is_tolls: false,
    start_date: '',
    end_date: ''
  };

  const validationSchema = Yup.object({
    day_of_week: Yup.string().required('Required'),
    start_time: Yup.string().required('Required'),
    end_time: Yup.string().required('Required')
  });

  const handleSubmit = async (values, actions) => {
    const method = travelParams ? 'PATCH' : 'POST';
    const url = travelParams ? `/api/users/${userId}/user_parameters/${travelParams.id}` : `/api/users/${userId}/user_parameters`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setTravelParams(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      actions.setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Day of Week</FormLabel>
              <Field name="day_of_week" as={Input} />
            </FormControl>
            <FormControl>
              <FormLabel>Start Time</FormLabel>
              <Field name="start_time" as={Input} type="time" />
            </FormControl>
            <FormControl>
              <FormLabel>End Time</FormLabel>
              <Field name="end_time" as={Input} type="time" />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Start Mandatory</FormLabel>
              <Switch name="is_start_mandatory" />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">End Mandatory</FormLabel>
              <Switch name="is_end_mandatory" />
            </FormControl>
            {/* Add other form fields here */}
            <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
              {travelParams ? 'Update' : 'Create'}
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default TravelParamsComponent;
