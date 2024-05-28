import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Switch, VStack } from '@chakra-ui/react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

const TempParamsComponent = ({ userId }) => {
  const [tempParams, setTempParams] = useState(null);

  useEffect(() => {
    const fetchTempParams = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/temp_params`);
        const data = await response.json();
        setTempParams(data);
      } catch (error) {
        console.error('Error fetching temp params:', error);
      }
    };

    fetchTempParams();
  }, [userId]);

  const initialValues = tempParams || {
    date: '',
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
    nullify_fixed: false,
    nullify_priority: false
  };

  const validationSchema = Yup.object({
    date: Yup.date().required('Required'),
    start_time: Yup.string().required('Required'),
    end_time: Yup.string().required('Required')
  });

  const handleSubmit = async (values, actions) => {
    const method = tempParams ? 'PATCH' : 'POST';
    const url = tempParams ? `/api/users/${userId}/temp_params/${tempParams.id}` : `/api/users/${userId}/temp_params`;

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
      setTempParams(data);
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
              <FormLabel>Date</FormLabel>
              <Field name="date" as={Input} type="date" />
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
              {tempParams ? 'Update' : 'Create'}
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default TempParamsComponent;

