import React from 'react';
import UserMobilDailyCalendar from '../components/UserMobilViewPage/UserMobilDailyCalendar';
import UserMobilMenuBar from '../components/UserMobilViewPage/UserMobilMenuBar';
import UserMobilParams from '../components/UserMobilViewPage/UserMobilParams';
import UserMobilRouteOptions from '../components/UserMobilViewPage/UserMobilRouteOptions';

const UserMobilViewPage = () => (
  <div>
    <h1>User Mobile View Page</h1>
    <UserMobilDailyCalendar />
    <UserMobilMenuBar />
    <UserMobilParams />
    <UserMobilRouteOptions />
  </div>
);

export default UserMobilViewPage;
