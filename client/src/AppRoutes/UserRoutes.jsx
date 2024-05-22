import React from "react";
import { Route, Routes } from "react-router-dom";
import Calendar from "../components/UserMenuPage/UserDailyView";
import Client from "../components/UserMenuPage/Client/UserClientList";
import Notes from "../components/UserMenuPage/Notes/UserNotesList";
import Notifications from "../components/UserMenuPage/Notifications/NotificationComp";
import Profile from "../components/UserMenuPage/Profile/UserProfile";
import Reports from "../components/UserMenuPage/Reports/UserReportsList";
import RoutesComponent from "../components/UserMenuPage/Routes/RouteOptions";
import UserMenuPage from "../pages/UserMenuPage";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/user" element={<UserMenuPage />}>
        <Route path="calendar" element={<Calendar />} />
        <Route path="client" element={<Client />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="reports" element={<Reports />} />
        <Route path="routes" element={<RoutesComponent />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;