import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  Select,
  CheckboxGroup,
  Checkbox,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Collapse,
} from "@chakra-ui/react";

const recurrenceOptionsTop = [
  { value: "EOW", label: "EOW" },
  { value: "MO", label: "Monthly" },
];

const recurrenceOptionsDays = [
  { value: "MO", label: "M" },
  { value: "TU", label: "Tu" },
  { value: "WE", label: "W" },
  { value: "TH", label: "Th" },
  { value: "FR", label: "F" },
  { value: "SA", label: "Sa" },
  { value: "SU", label: "Su" },
];

const EVENT_TYPE_MAP = {
  1: "Client Visit",
  2: "Personal Event",
  3: "Client Unavailable",
};

const EVENT_STATUS_MAP = {
  1: "Pending",
  2: "Confirmed",
  3: "Conflict",
  4: "Completed",
  5: "Canceled",
};

const EventForm = ({ isOpen, onClose, event, onSubmit }) => {
  const [showAddress, setShowAddress] = useState(false);
  const [showRecurrence, setShowRecurrence] = useState(event ? event.is_recurring : false);

  const initialValues = {
    notes: event ? event.notes : "",
    start: event ? event.start : "",
    end: event ? event.end : "",
    is_completed: event ? event.is_completed : false,
    priority: event ? event.priority : 1,
    client_name: event ? event.client_name : "",
    address: event ? event.address : "",
    city: event ? event.city : "",
    state: event ? event.state : "",
    zip: event ? event.zip : "",
    type: event ? event.type : 1,
    status: event ? event.status : 1,
    is_recurring: event ? event.is_recurring : false,
    recurrence_rule: event ? event.recurrence_rule : "",
    recurrence_end: event ? event.recurrence_end : "",
    recurrence_days: event ? event.recurrence_days : [],
  };

  const validationSchema = Yup.object({
    notes: Yup.string().required("Required"),
    start: Yup.date().required("Required"),
    end: Yup.date().required("Required"),
    type: Yup.number().required("Required"),
    status: Yup.number().required("Required"),
  });

  const createRRule = (values) => {
    let rrule = "";
    if (values.is_recurring) {
      if (values.recurrence_days.includes("EOW")) {
        rrule = `FREQ=WEEKLY;INTERVAL=2;BYDAY=${values.recurrence_days.filter((day) => day !== "EOW").join(",")}`;
      } else if (values.recurrence_days.includes("MO")) {
        rrule = `FREQ=MONTHLY`;
      } else {
        rrule = `FREQ=WEEKLY;BYDAY=${values.recurrence_days.join(",")}`;
      }
      if (values.recurrence_end) {
        rrule += `;UNTIL=${values.recurrence_end.replace(/-/g, "")}`;
      }
    }
    return rrule;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Event Form</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (values.is_completed) {
              values.status = 4; // Completed
            }
            values.recurrence_rule = createRRule(values);
            onSubmit(values);
            onClose();
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form>
              <ModalBody>
                <FormControl mt={4}>
                  <FormLabel>Client Name</FormLabel>
                  <Field name="client_name" as={Input} readOnly />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Start</FormLabel>
                  <Field name="start" type="datetime-local" as={Input} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>End</FormLabel>
                  <Field name="end" type="datetime-local" as={Input} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Completed</FormLabel>
                  <Field
                    name="is_completed"
                    type="checkbox"
                    as={Switch}
                    onChange={() => {
                      setFieldValue("is_completed", !values.is_completed);
                      if (!values.is_completed) {
                        setFieldValue("status", 4); // Completed
                      }
                    }}
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Priority</FormLabel>
                  <Field name="priority" as={Input} type="number" min="1" max="5" />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Type</FormLabel>
                  <Field as={Select} name="type">
                    {Object.entries(EVENT_TYPE_MAP).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </Field>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Status</FormLabel>
                  <Field as={Select} name="status">
                    {Object.entries(EVENT_STATUS_MAP).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </Field>
                </FormControl>
                <FormControl mt={4}>
                  <Button onClick={() => setShowAddress(!showAddress)}>
                    {showAddress ? "Hide Address" : "Add Address"}
                  </Button>
                </FormControl>
                <Collapse in={showAddress}>
                  <FormControl mt={4}>
                    <FormLabel>Address</FormLabel>
                    <Field name="address" as={Input} />
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>City</FormLabel>
                    <Field name="city" as={Input} />
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>State</FormLabel>
                    <Field name="state" as={Input} />
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>ZIP Code</FormLabel>
                    <Field name="zip" as={Input} />
                  </FormControl>
                </Collapse>
                <FormControl mt={4}>
                  <FormLabel>Does this shift recur?</FormLabel>
                  <Field
                    name="is_recurring"
                    type="checkbox"
                    as={Switch}
                    onChange={() => {
                      setFieldValue("is_recurring", !values.is_recurring);
                      setShowRecurrence(!showRecurrence);
                    }}
                  />
                </FormControl>
                <Collapse in={showRecurrence}>
                  <FormControl mt={4}>
                    <FormLabel>Recurrence Options</FormLabel>
                    <CheckboxGroup
                      value={values.recurrence_days}
                      onChange={(values) => setFieldValue("recurrence_days", values)}
                    >
                      <Stack spacing={5} direction="row" wrap="wrap">
                        {recurrenceOptionsTop.map((option) => (
                          <Checkbox key={option.value} value={option.value}>
                            {option.label}
                          </Checkbox>
                        ))}
                      </Stack>
                      <Stack spacing={5} direction="row" wrap="wrap" mt={4}>
                        {recurrenceOptionsDays.map((option) => (
                          <Checkbox key={option.value} value={option.value}>
                            {option.label}
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>Recurrence End Date</FormLabel>
                    <Field name="recurrence_end" type="date" as={Input} />
                  </FormControl>
                </Collapse>
                <FormControl mt={4}>
                  <FormLabel>Notes</FormLabel>
                  <Field name="notes" as={Textarea} />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} type="submit" isLoading={isSubmitting}>
                  Save
                </Button>
                <Button variant="ghost" onClick={onClose}>
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

export default EventForm;







