import { ChakraProvider } from "@chakra-ui/react";
import React, { createContext, useState } from "react";

import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import { UserProvider } from "./UserContext";
import NavBar from "./components/HomePage/NavBar";
import UserDailyView from "/src/components/UserMenuPage/UserDailyView";
import UserWeeklyView from "/src/components/UserMenuPage/Calendar/UserWeeklyView";
import UserMonthlyView from "/src/components/UserMenuPage/Calendar/UserMonthlyView";
import UserClientList from "/src/components/UserMenuPage/Client/UserClientList";
import UserNotesList from "/src/components/UserMenuPage/Notes/UserNotesList";
import UserNotificationsComp from "/src/components/UserMenuPage/Notifications/NotificationComp";
import UserProfile from "/src/components/UserMenuPage/Profile/UserProfile";
import UserReportsList from "/src/components/UserMenuPage/Reports/UserReportsList";
import RouteOptions from "/src/components/UserMenuPage/Routes/RouteOptions";
import UserMenuPage from "/src/pages/UserMenuPage";
import LogoutForm from "/src/components/UserMenuPage/Logout/LogoutForm";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
    setShowAbout(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
    setShowAbout(false);
  };

  const handleShowAbout = () => {
    setShowAbout(true);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleShowHome = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowAbout(false);
  };

  return (
    <ChakraProvider>
      <UserProvider>
        <div className="app">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <NavBar
                    onShowHome={handleShowHome}
                    onShowLogin={handleShowLogin}
                    onShowAbout={handleShowAbout}
                  />
                  <HomePage
                    showLogin={showLogin}
                    showRegister={showRegister}
                    showAbout={showAbout}
                    handleShowLogin={handleShowLogin}
                    handleShowRegister={handleShowRegister}
                  />
                </>
              }
            />
            <Route path="usermenu/:id/*" element={<UserMenuPage />}>
              <Route path="calendar" element={<UserDailyView />} />
                
              <Route path="clients" element={<UserClientList />} />
              <Route path="notes" element={<UserNotesList />} />
              <Route path="notifications" element={<UserNotificationsComp />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="reports" element={<UserReportsList />} />
              <Route path="routes" element={<RouteOptions />} />
              <Route path="logout" element={<LogoutForm />} />

            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </UserProvider>
    </ChakraProvider>
  );
}

export default App;

