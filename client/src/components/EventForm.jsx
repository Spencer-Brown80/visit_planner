import React, { useState, useEffect } from "react";
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
  HStack,
  Flex,
  IconButton,
  RadioGroup,
  Radio,
  Text,
} from "@chakra-ui/react";
import { FaMapMarkerAlt } from "react-icons/fa";
import ConflictModal from "/src/components/UserMenuPage/Calendar/ConflictModal";
import UpdateEventModal from "/src/components/UserMenuPage/Calendar/UpdateEventModal";
import DeleteEventModal from "/src/components/UserMenuPage/Calendar/DeleteEventModal";
import { RRule, rrulestr } from 'rrule'; // Correctly import rrule

const recurrenceOptionsTop = [
  { value: "Weekly", label: "Weekly" },
  { value: "EOW", label: "EOW" },
  { value: "Monthly", label: "Monthly" },
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

const recurrenceOptionsWeeks = [1, 2, 3, 4];

const EVENT_TYPE_MAP = {
  1: "Client Visit",
  2: "Personal Event",
  3: "Client Unavailable",
};

const REVERSE_EVENT_TYPE_MAP = {
  "Client Visit": 1,
  "Personal Event": 2,
  "Client Unavailable": 3,
};

const EVENT_STATUS_MAP = {
  1: "Pending",
  2: "Confirmed",
  // 3: "Conflict",
  4: "Completed",
  5: "Canceled",
};

const REVERSE_EVENT_STATUS_MAP = {
  "Pending": 1,
  "Confirmed": 2,
  // "Conflict": 3,
  "Completed": 4,
  "Canceled": 5,
};

// Define the adjustByHours function outside
const adjustByHours = (dateStr, hours) => {
  const date = new Date(dateStr);
  const adjustedDate = new Date(date.getTime() - hours * 60 * 60 * 1000);
  return adjustedDate.toISOString().split('.')[0]; // This will remove the milliseconds and the Z
};

// Function to generate recurring events
const generateRecurringEvents = (event) => {
  if (!event || !event.start) {
    console.error("Invalid event data passed to generateRecurringEvents:", event);
    return [];
  }

  const maxEndDate = new Date(event.start);
  maxEndDate.setDate(maxEndDate.getDate() + 180); // 180 days from start date
  const rule = rrulestr(event.recurrence_rule, { dtstart: new Date(event.start) });
  const occurrences = rule.between(new Date(event.start), maxEndDate, true); // Generate all occurrences

  const recurringEvents = occurrences.map((occurrence) => {
    if (occurrence > new Date(event.start)) {
      const end = new Date(occurrence);
      end.setTime(end.getTime() + (new Date(event.end) - new Date(event.start))); // Adjust end time
      return {
        start: occurrence.toISOString(),
        end: end.toISOString(),
        type: event.type,
        status: event.status,
        is_fixed: event.is_fixed,
        priority: event.priority,
        is_recurring: false, // Each generated event is not recurring itself
        recurrence_rule: event.recurrence_rule, // Include the recurrence rule
        notify_client: event.notify_client,
        notes: event.notes,
        is_completed: event.is_completed,
        is_endpoint: event.is_endpoint,
        address: event.address,
        city: event.city,
        state: event.state,
        zip: event.zip,
        user_id: event.user_id,
        user_client_id: event.user_client_id,
        parent_event_id: event.id, // Link to the original event
      };
    }
    return null;
  }).filter(event => event !== null);

  return recurringEvents;
};

const EventForm = ({ isOpen, onClose, event, onSubmit, clients, userId, events }) => {
  const [showAddress, setShowAddress] = useState(event ? !!event.address : false);
  const [showRecurrence, setShowRecurrence] = useState(event ? event.is_recurring : false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isUpdateEventModalOpen, setIsUpdateEventModalOpen] = useState(false);
  const [isDeleteEventModalOpen, setIsDeleteEventModalOpen] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [updateSeries, setUpdateSeries] = useState(false);

  const toLocalISOString = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    return new Date(date - tzOffset).toISOString().slice(0, 19);
  };

  const initialValues = {
    notes: event ? event.notes : "",
    start: event ? toLocalISOString(new Date(event.start)) : "",
    end: event ? toLocalISOString(new Date(event.end)) : "",
    is_completed: event ? event.is_completed : false,
    priority: event ? event.priority : 1,
    user_client_id: event ? event.user_client_id : "",
    address: event ? event.address || "" : "",
    city: event ? event.city || "" : "",
    state: event ? event.state || "" : "",
    zip: event ? event.zip || "" : "",
    type: event ? event.type : 1,
    status: event ? event.status : 2,
    is_recurring: event ? event.is_recurring : false,
    recurrence_rule: event ? event.recurrence_rule || "" : "",
    recurrence_end: event ? event.recurrence_end || "" : "",
    recurrence_days: event ? event.recurrence_days || [] : [],
    recurrence_option: event ? event.recurrence_option || "" : "",
    recurrence_weeks: event ? event.recurrence_weeks || [] : [],
    is_fixed: event ? event.is_fixed : false,
    is_endpoint: event ? event.is_endpoint : false,
    notify_client: event ? event.notify_client : false,
    user_id: userId,
    parent_event_id: event ? event.parent_event_id : null,
  };

  const validationSchema = Yup.object({
    notes: Yup.string().nullable(),
    start: Yup.date().required("Required"),
    end: Yup.date().required("Required"),
    type: Yup.number().required("Required"),
    status: Yup.number().required("Required"),
  });

  const createRRule = (values) => {
    let rrule = "";
    if (values.is_recurring) {
      if (values.recurrence_option === "EOW") {
        rrule = `FREQ=WEEKLY;INTERVAL=2;BYDAY=${values.recurrence_days.join(",")}`;
      } else if (values.recurrence_option === "Monthly") {
        const byDayValues = values.recurrence_weeks.map(week =>
          values.recurrence_days.map(day => `${week}${day}`).join(",")
        ).join(",");
        rrule = `FREQ=MONTHLY;BYDAY=${byDayValues}`;
      } else if (values.recurrence_option === "Weekly") {
        rrule = `FREQ=WEEKLY;BYDAY=${values.recurrence_days.join(",")}`;
      }
      if (values.recurrence_end) {
        rrule += `;UNTIL=${values.recurrence_end.replace(/-/g, "")}T235959Z`; // Ensure the end date is in UTC format
      }
    }
    return rrule;
  };

  const parseRecurrenceRule = (recurrenceRule, setFieldValue) => {
    if (!recurrenceRule) return;
    const parts = recurrenceRule.split(";");
    let recurrenceDays = [];
    let recurrenceEnd = "";
    let recurrenceOption = "";
    let recurrenceWeeks = [];

    parts.forEach((part) => {
      if (part.startsWith("FREQ=")) {
        const freq = part.replace("FREQ=", "");
        if (freq === "WEEKLY") {
          if (part.includes("INTERVAL=2")) {
            recurrenceOption = "EOW";
          } else {
            recurrenceOption = "Weekly";
          }
        } else if (freq === "MONTHLY") {
          recurrenceOption = "Monthly";
        }
      } else if (part.startsWith("BYDAY=")) {
        const days = part.replace("BYDAY=", "").split(",");
        if (recurrenceOption === "Monthly") {
          days.forEach(day => {
            const week = day[0];
            const dayOfWeek = day.substring(1);
            recurrenceWeeks.push(parseInt(week, 10));
            recurrenceDays.push(dayOfWeek);
          });
        } else {
          recurrenceDays = days;
        }
      } else if (part.startsWith("UNTIL=")) {
        const untilDate = part.replace("UNTIL=", "");
        recurrenceEnd = `${untilDate.substring(0, 4)}-${untilDate.substring(4, 6)}-${untilDate.substring(6, 8)}`;
      }
    });

    setFieldValue("recurrence_days", [...new Set(recurrenceDays)]);
    setFieldValue("recurrence_end", recurrenceEnd);
    setFieldValue("recurrence_option", recurrenceOption);
    setFieldValue("recurrence_weeks", [...new Set(recurrenceWeeks)]);
  };

  const checkForConflicts = (newEvent) => {
    const overlappingEvents = events.filter(e =>
      e.user_id === newEvent.user_id &&
      ((newEvent.start < e.end && newEvent.end > e.start) ||
      (newEvent.start === e.start && newEvent.end === e.end))
    );
    return overlappingEvents;
  };

  const handleSubmit = async (values, { setFieldValue }) => {
    const toUTCISOString = (dateStr) => {
      const date = new Date(dateStr);
      return date.toISOString(); // Converts to UTC ISO string
    };

    console.log("Form Values:", values); // Log form values

    const adjustedStart = adjustByHours(values.start, 4);
    const adjustedEnd = adjustByHours(values.end, 4);

    console.log("Adjusted Start:", adjustedStart); // Log adjusted start time
    console.log("Adjusted End:", adjustedEnd); // Log adjusted end time

    const eventData = {
      notes: values.notes,
      start: adjustedStart,
      end: adjustedEnd,
      is_completed: values.is_completed,
      priority: values.priority,
      user_id: parseInt(values.user_id, 10),
      user_client_id: values.user_client_id ? parseInt(values.user_client_id, 10) : null,
      address: values.address,
      city: values.city,
      state: values.state,
      zip: values.zip,
      type: parseInt(values.type, 10),
      status: parseInt(values.status, 10),
      is_recurring: values.is_recurring,
      recurrence_rule: createRRule(values),
      recurrence_end: values.recurrence_end,
      recurrence_days: values.recurrence_days,
      recurrence_weeks: values.recurrence_weeks,
      is_fixed: values.is_fixed,
      is_endpoint: values.is_endpoint,
      notify_client: values.notify_client,
      parent_event_id: values.parent_event_id,
    };

    console.log("Event data being sent:", eventData);

    if (event) {
      setIsUpdateEventModalOpen(true);
    } else {
      try {
        const response = await fetch(`/api/users/${userId}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        onSubmit(data);
        onClose();
      } catch (error) {
        console.error('Error creating event:', error);
      }
    }
  };

  const handleEndTimeUpdate = (start, durationMinutes) => {
    const endDate = new Date(new Date(start).getTime() + durationMinutes * 60000);
    return toLocalISOString(endDate);
  };

  const handleProceedWithConflicts = async (selectedConflicts) => {
    const updatedEvent = { ...event, ignore_conflicts: selectedConflicts };
    await handleSubmit(updatedEvent, { setFieldValue });
    setIsConflictModalOpen(false);
  };

  const handleProceedWithUpdate = async (updateSeries) => {
    try {
      const adjustedStart = adjustByHours(event.start, 4);
      const adjustedEnd = adjustByHours(event.end, 4);
      console.log(adjustedStart)
      const updatedEvent = {
        ...event,
        start: adjustedStart,
        end: adjustedEnd,
        update_series: updateSeries
      };

      if (updateSeries) {
        const response = await fetch(`/api/users/${userId}/events`);
        if (!response.ok) {
          throw new Error('Network response was not ok when fetching events');
        }

        const allEvents = await response.json();
        const eventsToDelete = allEvents.filter(e => e.parent_event_id === event.parent_event_id && e.start >= event.start);

        for (let eventToDelete of eventsToDelete) {
          const deleteResponse = await fetch(`/api/users/${userId}/events/${eventToDelete.id}`, {
            method: 'DELETE',
          });
          if (!deleteResponse.ok) {
            throw new Error('Network response was not ok when deleting events');
          }
        }

        const createResponse = await fetch(`/api/users/${userId}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedEvent),
        });

        if (!createResponse.ok) {
          throw new Error('Network response was not ok when creating the updated event');
        }

        const updatedEventData = await createResponse.json();

        const recurrenceRule = createRRule(updatedEventData);
        if (recurrenceRule) {
          const newEvents = generateRecurringEvents(updatedEventData);
          for (let newEvent of newEvents) {
            newEvent.parent_event_id = updatedEventData.id;
            const createNewResponse = await fetch(`/api/users/${userId}/events`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newEvent),
            });
            if (!createNewResponse.ok) {
              throw new Error('Network response was not ok when creating new events');
            }
          }
        }

        if (onSubmit) {
          onSubmit(updatedEventData);
        }
      } else {
        updatedEvent.parent_event_id = null;

        const method = 'PATCH';
        const url = `/api/users/${userId}/events/${event.id}`;

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
        console.log(updatedEvent.start)
        if (!response.ok) {
          throw new Error('Network response was not ok when updating the single event');
        }

        const updatedEventData = await response.json();

        if (onSubmit) {
          onSubmit(updatedEventData);
        }
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error updating event:', error);
    }
    setIsUpdateEventModalOpen(false);
  };

  const handleProceedWithDelete = async () => {
    try {
      if (updateSeries && event?.parent_event_id) {
        const response = await fetch(`/api/users/${userId}/events`);
        if (!response.ok) {
          throw new Error('Network response was not ok when fetching events');
        }

        const allEvents = await response.json();
        const eventsToDelete = allEvents.filter(e => e.parent_event_id === event.parent_event_id);

        for (let eventToDelete of eventsToDelete) {
          const deleteResponse = await fetch(`/api/users/${userId}/events/${eventToDelete.id}`, {
            method: 'DELETE',
          });
          if (!deleteResponse.ok) {
            throw new Error('Network response was not ok when deleting events');
          }
        }
      } else if (event) {
        const deleteResponse = await fetch(`/api/users/${userId}/events/${event.id}`, {
          method: 'DELETE',
        });
        if (!deleteResponse.ok) {
          throw new Error('Network response was not ok when deleting event');
        }
      }

      onClose();
      setIsDeleteEventModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };


  


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{event ? 'Event Details' : 'Add New Event'}</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values, setFieldValue }) => {
            useEffect(() => {
              if (event && event.recurrence_rule) {
                setTimeout(() => {
                  parseRecurrenceRule(event.recurrence_rule, setFieldValue);
                }, 0);
              }
            }, [event, setFieldValue]);

            return (
              <Form>
                <ModalBody>
                  <Flex justify="space-between">
                    <IconButton
                      icon={<FaMapMarkerAlt />}
                      as="a"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${values.address || `${clients.find(client => client.id === values.user_client_id)?.address_line_1}, ${clients.find(client => client.id === values.user_client_id)?.city}, ${clients.find(client => client.id === values.user_client_id)?.state}, ${clients.find(client => client.id === values.user_client_id)?.zip}`}`}
                      target="_blank"
                      aria-label="Get Directions"
                    />
                  </Flex>
                  <HStack mt={4} spacing={4}>
                    <FormControl>
                      <FormLabel>Completed</FormLabel>
                      <Field
                        name="is_completed"
                        type="checkbox"
                        as={Switch}
                        isChecked={values.is_completed}
                        onChange={() => {
                          setFieldValue("is_completed", !values.is_completed);
                          if (!values.is_completed) {
                            setFieldValue("status", 4); // Completed
                          }
                        }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      <Field as={Select} name="status" min="1" max="5">
                        {Object.entries(EVENT_STATUS_MAP).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </Field>
                    </FormControl>
                  </HStack>
                  <FormControl mt={4}>
                    <FormLabel>Client Name</FormLabel>
                    <Field as={Select} name="user_client_id">
                      <option value="" disabled>Select Client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </option>
                      ))}
                    </Field>
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>Start</FormLabel>
                    <Field
                      name="start"
                      type="datetime-local"
                      as={Input}
                      onChange={(e) => {
                        setFieldValue("start", e.target.value);
                        if (!event) {
                          setFieldValue("end", handleEndTimeUpdate(e.target.value, 60));
                        } else {
                          const duration = new Date(event.end) - new Date(event.start);
                          setFieldValue("end", handleEndTimeUpdate(e.target.value, duration / 60000));
                        }
                      }}
                    />
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>End</FormLabel>
                    <Field name="end" type="datetime-local" as={Input} />
                  </FormControl>
                  <HStack mt={4} spacing={4}>
                    <FormControl>
                      <FormLabel>Set Time</FormLabel>
                      <Field
                        name="is_fixed"
                        type="checkbox"
                        as={Switch}
                        isChecked={values.is_fixed}
                        onChange={() => {
                          setFieldValue("is_fixed", !values.is_fixed);
                        }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Priority</FormLabel>
                      <Field name="priority" as={Input} type="number" min="1" max="5" width="40px" height="25px" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Ongoing</FormLabel>
                      <Field
                        name="is_recurring"
                        type="checkbox"
                        as={Switch}
                        isChecked={values.is_recurring}
                        onChange={() => {
                          setFieldValue("is_recurring", !values.is_recurring);
                          setShowRecurrence(!showRecurrence);
                        }}
                      />
                    </FormControl>
                    <FormControl>
                      <Flex alignItems="center">
                        <FormLabel mb="0">Notify Client</FormLabel>
                        <Field
                          name="notify_client"
                          type="checkbox"
                          as={Switch}
                          isChecked={values.notify_client}
                          onChange={() => {
                            setFieldValue("notify_client", !values.notify_client);
                          }}
                        />
                      </Flex>
                    </FormControl>
                  </HStack>
                  <Collapse in={showRecurrence}>
                    <FormControl mt={4}>
                      <FormLabel>Recurrence Options</FormLabel>
                      <CheckboxGroup
                        value={values.recurrence_option ? [values.recurrence_option] : []}
                        onChange={(value) => {
                          const option = value[0];
                          setFieldValue("recurrence_option", option);
                          if (option !== "Monthly") {
                            setFieldValue("recurrence_weeks", []);
                          }
                        }}
                      >
                          <Stack spacing={5} direction="row" wrap="wrap">
                          {recurrenceOptionsTop.map((option) => (
                            <Checkbox key={option.value} value={option.value}>
                              {option.label}
                            </Checkbox>
                          ))}
                        </Stack>
                      </CheckboxGroup>
                      {values.recurrence_option && (
                        <>
                          {values.recurrence_option === "Monthly" && (
                            <CheckboxGroup
                              value={values.recurrence_weeks}
                              onChange={(value) => setFieldValue("recurrence_weeks", value)}
                            >
                              <Stack spacing={5} direction="row" wrap="wrap" mt={4}>
                                {recurrenceOptionsWeeks.map((week) => (
                                  <Checkbox key={week} value={week}>
                                    {`${week}th`}
                                  </Checkbox>
                                ))}
                              </Stack>
                            </CheckboxGroup>
                          )}
                          <CheckboxGroup
                            value={values.recurrence_days}
                            onChange={(value) => setFieldValue("recurrence_days", value)}
                          >
                            <Stack spacing={5} direction="row" wrap="wrap" mt={4}>
                              {recurrenceOptionsDays.map((option) => (
                                <Checkbox key={option.value} value={option.value}>
                                  {option.label}
                                </Checkbox>
                              ))}
                            </Stack>
                          </CheckboxGroup>
                        </>
                      )}
                    </FormControl>
                    <FormControl mt={4}>
                      <FormLabel>Recurrence End Date</FormLabel>
                      <Field name="recurrence_end" type="date" as={Input} />
                    </FormControl>
                  </Collapse>
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
                    <FormLabel>Notes</FormLabel>
                    <Field name="notes" as={Textarea} />
                  </FormControl>
                  <HStack mt={4} spacing={4}>
                    <FormControl>
                      <FormLabel>Add Address</FormLabel>
                      <Field
                        name="show_address"
                        type="checkbox"
                        as={Switch}
                        onChange={() => setShowAddress(!showAddress)}
                        checked={showAddress}
                      />
                    </FormControl>
                  </HStack>
                  <Collapse in={showAddress}>
                    <FormControl>
                      <FormLabel>Is Endpoint</FormLabel>
                      <Field
                        name="is_endpoint"
                        type="checkbox"
                        as={Switch}
                        isChecked={values.is_endpoint}
                        onChange={() => {
                          setFieldValue("is_endpoint", !values.is_endpoint);
                        }}
                      />
                    </FormControl>
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
                </ModalBody>
                <ModalFooter justifyContent="space-between">
                  <Button colorScheme="blue" type="button" isLoading={isSubmitting} onClick={() => handleSubmit(values, { setFieldValue })}>
                    {event ? "Update" : "Create"}
                  </Button>
                  {event && (
                    <Button colorScheme="red" onClick={() => setIsDeleteEventModalOpen(true)}>
                      Delete
                    </Button>
                  )}
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
        <ConflictModal
          isOpen={isConflictModalOpen}
          onClose={() => setIsConflictModalOpen(false)}
          conflicts={conflicts}
          onProceed={handleProceedWithConflicts}
        />
        <UpdateEventModal
          isOpen={isUpdateEventModalOpen}
          onClose={() => setIsUpdateEventModalOpen(false)}
          onProceed={handleProceedWithUpdate}
          onChangeUpdateSeries={setUpdateSeries}
        />
        <DeleteEventModal
          isOpen={isDeleteEventModalOpen}
          onClose={() => setIsDeleteEventModalOpen(false)}
          onProceed={handleProceedWithDelete}
          onChangeUpdateSeries={(value) => setUpdateSeries(value === "true")}
          isSeries={event ? !!event.parent_event_id : false}
        />
      </ModalContent>
    </Modal>
  );
};

export default EventForm;
