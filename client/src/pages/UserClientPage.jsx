import React from 'react';
import UserClientMonthlyView from '../components/UserClientPage/Calendar/UserClientMonthlyView';
import UserClientWeeklyView from '../components/UserClientPage/Calendar/UserClientWeeklyView';
import UserClientContactForm from '../components/UserClientPage/Contacts/UserClientContactForm';
import UserClientContactsList from '../components/UserClientPage/Contacts/UserClientContactsList';
import UserClientNewContactForm from '../components/UserClientPage/Contacts/UserClientNewContactForm';
import UserClientNoteForm from '../components/UserClientPage/Notes/UserClientNoteForm';
import UserClientNotesList from '../components/UserClientPage/Notes/UserClientNotesList';
import UserClientProfile from '../components/UserClientPage/Profile/UserClientProfile';

const UserClientPage = () => (
  <div>
    <h1>User Client Page</h1>
    <UserClientMonthlyView />
    <UserClientWeeklyView />
    <UserClientContactForm />
    <UserClientContactsList />
    <UserClientNewContactForm />
    <UserClientNoteForm />
    <UserClientNotesList />
    <UserClientProfile />
  </div>
);

export default UserClientPage;
