import React, { useEffect, useState, useContext } from "react";
import { Box, Text, useDisclosure } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventForm from "/src/components/EventForm";

const localizer = momentLocalizer(moment);

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

const UserDailyView = () => {
  const { id } = useParams();
  const { userId } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const user_id = id || userId;

    if (user_id) {
      fetch(`/api/users/${user_id}/events`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          const formattedEvents = data.map((event) => ({
            id: event.id,
            title: `${event.client_name}: ${EVENT_TYPE_MAP[event.type]} - ${EVENT_STATUS_MAP[event.status]}`,
            start: new Date(event.start),
            end: new Date(event.end),
            ...event,
          }));
          setEvents(formattedEvents);
        })
        .catch((error) => console.error("Error fetching events:", error));
    }
  }, [id, userId]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  const handleEventSubmit = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === selectedEvent.id ? { ...event, ...updatedEvent } : event
      )
    );
    // Add code to update the event in the backend if needed
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" fontWeight="bold">
        User Daily View
      </Text>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
      />
      {selectedEvent && (
        <EventForm
          isOpen={isOpen}
          onClose={onClose}
          event={selectedEvent}
          onSubmit={handleEventSubmit}
        />
      )}
    </Box>
  );
};

export default UserDailyView;







