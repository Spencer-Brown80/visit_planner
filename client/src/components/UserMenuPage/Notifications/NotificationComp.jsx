import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, Button, HStack } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useParams, useNavigate } from "react-router-dom";


const notificationColors = {
  overlap: 'orange.200',
  pastDue: 'red.200'
};

const notificationTypes = {
  overlap: 'Overlapping Shifts',
  pastDue: 'Past Due Shifts'
};

const NotificationComp = () => {
  const { id } = useParams();

  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetch(`/api/users/${id}/events`)
      .then(response => response.json())
      .then(data => {
        const formattedEvents = data.map(event => ({
          id: event.id,
          title: event.notes || '',
          start: new Date(event.start),
          end: new Date(event.end),
          is_completed: event.is_completed,
        }));
        setEvents(formattedEvents);
      })
      .catch(error => console.error('Error fetching events:', error));
  }, [id]);

  useEffect(() => {
    const overlaps = [];
    const pastDue = [];
    const now = new Date();

    // Find overlapping events
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        if (events[i].end > events[j].start && events[i].start < events[j].end) {
          overlaps.push({ type: 'overlap', event1: events[i], event2: events[j] });
        }
      }
    }

    // Find past-due events
    for (const event of events) {
      if (event.end < now && !event.is_completed) {
        pastDue.push({ type: 'pastDue', event });
      }
    }

    const allNotifications = [...overlaps, ...pastDue];
    const sortedNotifications = allNotifications.sort((a, b) => {
      const dateA = a.type === 'overlap' ? a.event1.start : a.event.start;
      const dateB = b.type === 'overlap' ? b.event1.start : b.event.start;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setNotifications(sortedNotifications);
  }, [events, sortOrder]);

  return (
    <Box p={4}>
      <HStack justifyContent="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">Notifications</Text>
        <Button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          Sort by Date: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </Button>
      </HStack>
      <VStack align="stretch" spacing={4}>
        {notifications.length === 0 ? (
          <Text>No notifications at this time</Text>
        ) : (
          notifications.map((notification, index) => (
            <Box
              key={index}
              p={4}
              shadow="md"
              borderWidth="1px"
              bg={notificationColors[notification.type]}
            >
              {notification.type === 'overlap' ? (
                <Text>
                  {notificationTypes[notification.type]} between "{notification.event1.title}" 
                  on {format(notification.event1.start, 'PPpp')} and 
                  "{notification.event2.title}" on {format(notification.event2.start, 'PPpp')}.
                </Text>
              ) : (
                <Text>
                  {notificationTypes[notification.type]}: "{notification.event.title}" 
                  on {format(notification.event.start, 'PPpp')}.
                </Text>
              )}
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default NotificationComp;
