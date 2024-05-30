import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input, Select, Switch } from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const CONTACT_TYPE_MAP = {
  1: "POA",
  2: "Family",
  3: "Friend",
  4: "Medical"
};



const UserClientContactForm = ({ isOpen, onClose, contact, clientId, userId, onFormSubmit }) => {
  const initialValues = {
    name: contact ? contact.name : '',
    phone: contact ? contact.phone : '',
    email: contact ? contact.email : '',
    type: contact ? contact.type : '',
    is_notified: contact ? contact.is_notified : false,
    notes: contact ? contact.notes : ''
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required'),
    phone: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    type: Yup.string().required('Required'),
    notes: Yup.string()
  });

  const handleSubmit = async (values, actions) => {
    const method = contact ? 'PATCH' : 'POST';
    const url = contact ? `/api/user_clients/${clientId}/user_client_contacts/${contact.id}` : `/api/user_clients/${clientId}/user_client_contacts`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...values, user_client_id: clientId, type: parseInt(values.type) })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      onFormSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      actions.setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/user_clients/${clientId}/user_client_contacts/${contact.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      onFormSubmit();
      onClose();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{contact ? 'Edit Contact' : 'Add New Contact'}</ModalHeader>
        <ModalCloseButton />
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, values, setFieldValue }) => (
            <Form>
              <ModalBody>
                <FormControl mt={4}>
                  <FormLabel>Name</FormLabel>
                  <Field name="name" as={Input} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Phone</FormLabel>
                  <Field name="phone" as={Input} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Email</FormLabel>
                  <Field name="email" as={Input} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Type</FormLabel>
                  <Field name="type" as={Select}>
                    <option value="" disabled>Select type</option>
                    {Object.entries(CONTACT_TYPE_MAP).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Field>
                </FormControl>
                <FormControl display="flex" alignItems="center" mt={4}>
                  <FormLabel mb="0">Notify Contact</FormLabel>
                  <Switch
                    isChecked={values.is_notified}
                    onChange={() => setFieldValue("is_notified", !values.is_notified)}
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Notes</FormLabel>
                  <Field name="notes" as={Input} />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
                  {contact ? 'Update' : 'Create'}
                </Button>
                {contact && (
                  <Button colorScheme="red" ml={3} onClick={handleDelete}>
                    Delete
                  </Button>
                )}
                <Button variant="ghost" ml={3} onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};

export default UserClientContactForm;
