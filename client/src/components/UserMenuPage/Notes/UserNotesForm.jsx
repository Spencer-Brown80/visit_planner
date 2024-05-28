import React, { useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Textarea, Select } from '@chakra-ui/react';

const UserNotesForm = ({ note, userId, onClose, onSubmit }) => {
  const initialValues = {
    type: note ? note.type : 1,
    content: note ? note.content : '',
    user_id: userId,
  };

  const validationSchema = Yup.object({
    type: Yup.number().required('Required'),
    content: Yup.string().required('Required'),
  });

  const handleSubmit = async (values) => {
    const noteData = {
      type: values.type,
      content: values.content,
      user_id: userId,
    };

    try {
      const response = await fetch(`/api/users/${userId}/user_notes/${note ? note.id : ''}`, {
        method: note ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{note ? 'Edit Note' : 'Add Note'}</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <ModalBody>
                <FormControl mt={4}>
                  <FormLabel>Type</FormLabel>
                  <Field as={Select} name="type">
                    <option value={1}>General</option>
                    <option value={2}>Important</option>
                  </Field>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Content</FormLabel>
                  <Field as={Textarea} name="content" />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
                  {note ? 'Save' : 'Create'}
                </Button>
                <Button variant="ghost" onClick={onClose} ml={3}>
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

export default UserNotesForm;
