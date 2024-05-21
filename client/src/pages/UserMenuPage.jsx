import React from 'react';
import UserMonthlyView from '../components/UserMenuPage/Calendar/UserMonthlyView';
import UserWeeklyView from '../components/UserMenuPage/Calendar/UserWeeklyView';
import NewUserClientForm from '../components/UserMenuPage/Client/NewUserClientForm';
import UserClientList from '../components/UserMenuPage/Client/UserClientList';
import UserNotesForm from '../components/UserMenuPage/Notes/UserNotesForm';
import UserNotesList from '../components/UserMenuPage/Notes/UserNotesList';
import UserProfile from '../components/UserMenuPage/Profile/UserProfile';
import TravelParamsComponent from '../components/UserMenuPage/Profile/TravelParamsComponent';
import UserReport1 from '../components/UserMenuPage/Reports/UserReport1';
import UserReportsList from '../components/UserMenuPage/Reports/UserReportsList';
import NotificationComp from '../components/UserMenuPage/Notifications/NotificationComp';
import UserDailyView from '../components/UserMenuPage/UserDailyView';
import UserMenuBar from '../components/UserMenuPage/UserMenuBar';

const UserMenuPage = () => (
  <div>
    <h1>User Menu Page</h1>
    <UserMonthlyView />
    <UserWeeklyView />
    <NewUserClientForm />
    <UserClientList />
    <UserNotesForm />
    <UserNotesList />
    <UserProfile />
    <TravelParamsComponent />
    <UserReport1 />
    <UserReportsList />
    <NotificationComp />
    <UserDailyView />
    <UserMenuBar />
  </div>
);

export default UserMenuPage;
