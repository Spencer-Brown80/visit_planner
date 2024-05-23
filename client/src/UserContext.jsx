import React, { createContext, useState } from "react";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [userId, setUserId] = useState(null); // Add userId state
  console.log(userId)
  return (
    <UserContext.Provider value={{ isLogin, setIsLogin, userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
