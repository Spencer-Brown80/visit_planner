import React from "react";
import { Route, Routes } from "react-router-dom";
import Calendar from "../components/UserMenuPage/UserDailyView";
import UserClientList from "/src/components/UserMenuPage/Client/UserClientList";
import UserNotesList from "../components/UserMenuPage/Notes/UserNotesList";
import UserNotificationsComp from "../components/UserMenuPage/Notifications/NotificationComp";
import UserProfile from "../components/UserMenuPage/Profile/UserProfile";
import UserReportsList from "../components/UserMenuPage/Reports/UserReportsList";
import RouteOptions from "../components/UserMenuPage/Routes/RouteOptions";
import UserMenuPage from "../pages/UserMenuPage";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="usermenu" element={<UserMenuPage />}>
        <Route path="calendar" element={<Calendar />} />
        <Route path="clients" element={<UserClientList />} />
        <Route path="notes" element={<UserNotesList />} />
        <Route path="notifications" element={<UserNotificationsComp />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="reports" element={<UserReportsList />} />
        <Route path="routes" element={<RouteOptions />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;