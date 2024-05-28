import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input, Textarea, Select } from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const noteTypes = {
  1: 'General',
  2: 'Schedule'
};

const reverseNoteTypes = Object.fromEntries(Object.entries(noteTypes).map(([key, value]) => [value, parseInt(key)]));


const UserClientNoteForm = ({ isOpen, onClose, note, clientId, userId, onFormSubmit }) => {
  const initialValues = {
    content: note ? note.content : '',
    type: note ? note.type : ''
  };

  const validationSchema = Yup.object({
    content: Yup.string().required('Required'),
    type: Yup.string().required('Required')
  });

  const handleSubmit = async (values, actions) => {
    const method = note ? 'PATCH' : 'POST';
    const url = note ? `/api/user_clients/${clientId}/user_client_notes/${note.id}` : `/api/user_clients/${clientId}/user_client_notes`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...values, user_client_id: clientId})
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
      const response = await fetch(`/api/user_clients/${clientId}/user_client_notes/${note.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      onFormSubmit();
      onClose();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{note ? 'Edit Note' : 'Add New Note'}</ModalHeader>
        <ModalCloseButton />
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <ModalBody>
                <FormControl mt={4}>
                  <FormLabel>Content</FormLabel>
                  <Field name="content" as={Textarea} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Type</FormLabel>
                  <Field name="type" as={Select}>
                    <option value="" disabled>Select type</option>
                    {Object.entries(noteTypes).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Field>
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
                  {note ? 'Update' : 'Create'}
                </Button>
                {note && (
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

export default UserClientNoteForm;
