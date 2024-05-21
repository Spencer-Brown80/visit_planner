import { ChakraProvider } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UserMenuPage from "./pages/UserMenuPage";
import UserClientPage from "./pages/UserClientPage";
import UserMobilViewPage from "./pages/UserMobilViewPage";
import NotFoundPage from "./pages/NotFoundPage";
import UserContext from "./UserContext";
import { useState } from "react";
import NavBar from "./components/HomePage/NavBar";
import UserProfile from "./components/UserMenuPage/Profile/UserProfile";


function App() {
  const [isLogin, setIsLogin] = useState(false); // State to store the login status
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
      <UserContext.Provider value={{ isLogin, setIsLogin }}>
        <div className="app">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <NavBar onShowHome={handleShowHome} onShowLogin={handleShowLogin} onShowAbout={handleShowAbout} />
                  <HomePage showLogin={showLogin} showRegister={showRegister} showAbout={showAbout} handleShowLogin={handleShowLogin} handleShowRegister={handleShowRegister} />
                </>
              }
            />
            <Route path="/user" element={<UserMenuPage />}>
              <Route path="profile" element={<UserProfile />} />
            </Route>
            <Route path="/user-clients" element={<UserClientPage />} />
            <Route path="/user-mobil" element={<UserMobilViewPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </UserContext.Provider>
    </ChakraProvider>
  );
}

export default App;
