# BiteReserve

<!-- Headings -->

## Description

VisitPlanner is a tool for home care nurses to flexibly plan their client visits.  Users can easily add new clients and events while calculating the best route to take based on travel time and priority.   

The application will use its own database, but will also incorporate Google Maps API as well as the Google Geolocation API.  

## Wireframe

### Home Page

<!-- ![HomePage] -->

### About Page

<!-- ![AboutPage] -->

### Login Page

<!-- ![LoginPage] -->

### Register Page

<!-- ![RegisterPage] -->

### Daily View / User Menu Page

<!-- ![UserMenuPage](./planning/UserMenuPage.png) -->

### Weekly View / User Calendar Page

<!-- ![UserCalendarPage](./planning/UserCalendarPage.png) -->

### Monthly View Page

<!-- ![UserMonthlyViewPage](./planning/UserMonthlyViewPage.png) -->

### User Profile Page

<!-- ![UserProfilePage](./planning/UserProfilePage.png) -->

### User Notes Page

<!-- ![UserNotesPage](./planning/UserNotesPage.png) -->

### Client List Page

<!-- ![ClientListPage](./planning/ClientListPage.png) -->

### Client Weekly View / Client Page

<!-- ![ClientPage](./planning/ClientPage.png) -->

### Client Monthly View Page

<!-- ![ClientMonthlyViewPage](./planning/ClientMonthlyViewPage.png) -->

### Client Profile Page

<!-- ![ClientProfilePage](./planning/ClientProfilePage.png) -->

### Client Notes Page

<!-- ![ClientNotesPage](./planning/ClientNotesPage.png) -->

### Client Contacts Page

<!-- ![ClientContactsPage](./planning/ClientContactsPage.png) -->

### Routes Page

<!-- ![RoutesPage](./planning/RoutesPage.png) -->

### Reports Page

<!-- ![ReportsPage](./planning/ReportsPage.png) -->

### Event Form

<!-- ![EventForm](./planning/EventForm.png) -->



## User Stories

1. Users can see a brief description of the app and will have a choice to login/register or view the about page.

2. Users must log in to the website to utilize the app.

3. Users can view info about the site on the “About” page.

4. Users can log into the app with a unique username and password.

5. Users can register on the app, where they set up a username and password.

6. Users can view the Daily View / User Menu with their current daily schedule upon login.

7. From the Daily View /User Menu, Users can select Clients (view client list), Profile (view user profile), Calendar (view weekly view page), Notes(view user notes page), Routes (view the current/select dates travel route), Reports(view the Reports page), and Daily View (the current page).   

8. From the Daily View / User Menu, Users can add, view, confirm, update and delete that days events.   

9. From the Daily View / User Menu, Users can also select another date from a calendar to view that day's Daily View. 

10. From the Daily View / User Menu, Users can select 'Open in Maps' on an event to be taken to directions from that User's current location to the selected event address.

11. From the Daily View / User Menu, Users can select View Routes to view that days travel route in the Routes page.

12. From the Clients List Page, the User can add a client or select a client from a list.  Selecting a client will take the User to the Client Page.   Selecting add a client will take the User to a blank Customer Profile Page that must be saved to create a new client.    

13. From the Selected Client page, the User can view, add, update and delete events in the Client's weekly schedule, select to view the Client's Profile, Monthly Calendar, Client Notes and Contacts Page.   The User can also select another week to view.   

14. From the Client's Profile page, the User can view and update the Client's profile.  The User can also add, view, update and delete client scheduling parameters saved by weekday.   

15. From the Client's Notes page, the User can add, view, update and delete Client notes.   

16. From the Client's Contacts page, the User can add, view, update and delete Client contacts.

17. From the Client's Monthly Calendar Page, the User can select individual events or a week of events to view.    

18. From the User Profile Page, the User can view and update the User's profile.   The User can also set their User parameters by the day of the week.

19. From the User's notes page, the User can add, view, update and delete User notes. 

20. From the User's Calendar page, the User will view their weekly calendar.  The User can add, view, update and delete events.   The User can select anouther week to view or a monthly view.  

21. From the User's Monthly View page, the User can select individual events or a week of events to view.   

22.  From the User's Reports page, the User can view reports regarding visits made and mileage.    

23. From the User's Routes page, the User can view the selected dates routes.  The default is set to today.   This page will show google directions starting from the starting point through all events and then to the ending point.  Once en event is confirmed as complete, the Routes page will show only directions from the last confirmed shift onward.  The User can modify the parameters for that day and have them persist.   

24. From the User's Routes page, the User can recalculate the day's route.  The User can temporarily remove and update parameters as needed to calculate the most appropriate route.  The User will be able to select from more than one route option.   If the User's selected route changes the start time's of the events, the events will be updated in the calendar.   The User can also re-calculate the day's route after the last confirmed shift of the day.   When recalculating the route during the middle of the day, the User's location can be used as the starting point. 

25. From the User's Routes page, the User can 'Add an open shift' which takes in a name and address.   It will be added to the current set of today's remaining events.   It will recalculate the route with the remaining events to display options to the User.    The User can select an option to update the calendar and add the open shift as a one time event.   

26. The User can select the start time of an Event, duration, date, priority and isFixed.  Notes can also be added.   The User can set a recurrence on the event by day of the week.  Any updates to events in a series will update the whole series.   The User can mark a shift as complete manually or use geolocation to confirm the shift as complete.    

27. The User can set user parameters.   Users can change their start/end address, availability by day of week, avoid tolls, avoid highways, shortest distance and shortest time.  

28. The User can add, view, update and delete both User and Client notifications.  The User can select to be notified of overlapping schedules and travel delays.   The User can select/deselect for the Client/Client Contact to be notified of changes in the schedule within a given time frame.   








## React Components Tree

<!-- ![ReactComponentsTree](./planning/ComponentTree.png) -->

## Database Schema

![Database](./planning/Database.png)

## Constraints

- All users should have an unique usernames
- All events must have a verified address

## Validations

- User and Client addresses must be in correct format
- User and Client phone numbers and emails must be in the correct format
- Notes cannot be empty and must have a type
- All Notes must have a type
- All Events must have a valid start time in the right format
- All Events must have a valid date in the right format
- Parameter start and end times must be in the correct format
- All contact info must be non-empty and in the correct format.
- The name of the user must be non-empty
- The username and password of the user must be non-empty
- Modified daily parameters will override default parameters
- Fixed schedules need to be manually updated


## API Routes

<!-- ![API Routes](./planning/API-Route.png) -->

## Example of a Response Structure

GET /events

<!-- ![ResponseStructure](./planning/ResponseStructure.png) -->

## React Routes

<!-- ![ReactRoutes](./planning/ReactRoutes.png) -->

## Stretch Goals

1. Users can update routes in calendar based on parameters.   

2. Users can receive text messages or notifications as well as Clients/Contacts.

3. Users can choose between different route options when calculating/recalculating the route.   

4. Users can confirm they completed shift using geolocation.    

## Trello Board

<!-- ![Trello Board](./planning/TrelloBoard.png)   -->