import React, { useEffect, useState } from "react";
import { Box, Text, Button, useDisclosure, HStack, Select, Badge, Stack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventForm from "/src/components/EventForm";
import ConflictModal from "/src/components/UserMenuPage/Calendar/ConflictModal";
import UpdateEventModal from "/src/components/UserMenuPage/Calendar/UpdateEventModal";

const localizer = momentLocalizer(moment);

const EVENT_STATUS_COLORS = {
  1: "gray", // Pending
  2: "green", // Confirmed
  3: "yellow", // Conflict
  4: "blue", // Completed
  5: "magenta", // Canceled
};

const EVENT_TYPE_LABELS = {
  1: "Client Visit",
  2: "Personal Time",
  3: "Client Unavailable",
};

const EVENT_STATUS_LABELS = {
  1: "Pending",
  2: "Confirmed",
  3: "Conflict",
  4: "Completed",
  5: "Canceled",
};

const UserCalendar = () => {
  const { id } = useParams();
  const userId = parseInt(id, 10); // Convert id to integer

  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState("my");
  const [selectedClient, setSelectedClient] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [isUpdateEventModalOpen, setIsUpdateEventModalOpen] = useState(false);
  const [updateSeries, setUpdateSeries] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchClients();
  }, [userId]);

  const fetchEvents = () => {
    if (userId) {
      fetch(`/api/users/${userId}/events`)
        .then(response => response.json())
        .then(data => {
          const formattedEvents = data.map(event => ({
            title: `${event.client_name}: ${event.notes || ""}`,
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            date_created: new Date(event.date_created),
          }));
          setEvents(formattedEvents);
        })
        .catch(error => console.error("Error fetching events:", error));
    }
  };

  const fetchClients = () => {
    fetch(`/api/user_clients`)
      .then(response => response.json())
      .then(data => {
        setClients(data);
        console.log('Clients:', data); // Log clients data
      })
      .catch(error => console.error("Error fetching clients:", error));
  };

  const handleSelectEvent = event => {
    setSelectedEvent(event);
    onOpen();
  };

  const checkForConflicts = (newEvent) => {
    const overlappingEvents = events.filter(e =>
      e.user_id === newEvent.user_id &&
      ((newEvent.start < e.end && newEvent.end > e.start) ||
      (newEvent.start === e.start && newEvent.end === e.end))
    );
    return overlappingEvents;
  };

  const handleEventSubmit = async (updatedEvent, deletedEventId) => {
    if (deletedEventId) {
      setEvents(events.filter(event => event.id !== deletedEventId));
    } else if (updatedEvent) {
      const overlappingEvents = checkForConflicts(updatedEvent);
      if (overlappingEvents.length > 0) {
        setConflicts(overlappingEvents);
        setIsConflictModalOpen(true);
      } else {
        // Proceed with updating events
        await updateEvent(updatedEvent, false);
      }
    } else {
      fetchEvents();
    }
  };

  const updateEvent = async (event, ignoreConflicts) => {
    const response = await fetch(`/api/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, ignore_conflicts: ignoreConflicts }),
    });
    const data = await response.json();
    setEvents(events.map(e => (e.id === data.id ? data : e)));
    setSelectedEvent(data);
  };

  const handleProceedWithConflicts = async (selectedConflicts) => {
    const updatedEvent = { ...selectedEvent, ignore_conflicts: selectedConflicts };
    await updateEvent(updatedEvent, true);
  };

  const handleProceedWithUpdate = async () => {
    const updatedEvent = { ...selectedEvent, update_series: updateSeries };
    await handleEventSubmit(updatedEvent);
    setIsUpdateEventModalOpen(false);
  };

  const handleCancelConflict = () => {
    setIsConflictModalOpen(false);
  };

  const handleSlotSelect = slotInfo => {
    const newEvent = {
      start: slotInfo.start,
      end: slotInfo.end,
      user_id: userId,
      user_client_id: view === "client" && selectedClient ? parseInt(selectedClient) : null,
    };
    setSelectedEvent(newEvent);
    onOpen();
  };

  const toggleView = () => {
    setView(view === "my" ? "client" : "my");
    setSelectedClient(null); // Reset selected client when switching views
  };

  const filteredEvents = events.filter(event => {
    if (view === "my") {
      return event.type !== 3; // Exclude "Client Unavailable" events
    } else if (view === "client") {
      return event.type !== 2; // Exclude "Personal Event" events
    }
    return true;
  });

  const renderEvent = event => {
    const isOverdue = !event.event.is_completed && new Date() > new Date(event.event.end);
    const color = isOverdue ? "red" : EVENT_STATUS_COLORS[event.event.status];
  
    // Extract client_name and notes from the event.title
    const [clientNameRaw] = event.event.title.split(": ");
    const [firstName, lastName] = clientNameRaw.split(" ");
    const clientName = lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName;
    const eventTypeLabel = EVENT_TYPE_LABELS[event.event.type];
    return (
      <span>
        {clientName ? `${clientName} : ${eventTypeLabel}` : eventTypeLabel}
        {/* Removed Badge for color */}
      </span>
    );
  };

  const eventPropGetter = (event) => {
    const isOverdue = !event.is_completed && new Date() > new Date(event.end);
    const backgroundColor = isOverdue ? "red" : EVENT_STATUS_COLORS[event.status];
    return { style: { backgroundColor } };
  };

  return (
    <Box p={4}>
      <HStack justifyContent="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="bold"></Text>
        <Button onClick={() => { setSelectedEvent(null); onOpen(); }}>Add Event</Button>
        <Button onClick={toggleView}>
          {view === "my" ? "Switch to Client View" : "Switch to My View"}
        </Button>
      </HStack>
      {view === "client" && (
        <Select
          mb={4}
          placeholder="Select client"
          onChange={(e) => setSelectedClient(e.target.value)}
          value={selectedClient || ""}
        >
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.first_name} {client.last_name}
            </option>
          ))}
        </Select>
      )}
      <Stack direction="row" mb={4}>
        {Object.entries(EVENT_STATUS_LABELS).map(([status, label]) => (
          <Badge key={status} colorScheme={EVENT_STATUS_COLORS[status]}>{label}</Badge>
        ))}
      </Stack>
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSlotSelect}
        selectable
        views={view === "client" ? [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA] : [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        components={{
          event: renderEvent
        }}
        eventPropGetter={eventPropGetter}
      />
      {isOpen && (
        <EventForm
          isOpen={isOpen}
          onClose={onClose}
          event={selectedEvent}
          clients={clients}
          userId={userId}
          onSubmit={handleEventSubmit}
          events={events} // Pass the events array to EventForm
        />
      )}
      <ConflictModal
        isOpen={isConflictModalOpen}
        onClose={handleCancelConflict}
        conflicts={conflicts}
        onProceed={handleProceedWithConflicts}
      />
      <UpdateEventModal
        isOpen={isUpdateEventModalOpen}
        onClose={() => setIsUpdateEventModalOpen(false)}
        onProceed={handleProceedWithUpdate}
        onChangeUpdateSeries={setUpdateSeries}
      />
    </Box>
  );
};

export default UserCalendar;
