import { createContext, useState, useEffect, useContext } from "react";

// 1. Create the context
const AuthContext = createContext(null);

// 2. Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { name, email, token }
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check localStorage on load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLoggedIn(true);
    }
  }, []);

  // 3. Signup handler
  const signup = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    setUser(userData);
    setIsLoggedIn(true);
  };


  //login handler
   const login = (userData, token) => {
    console.log("tri",userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  // 4. Logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsLoggedIn(false);
  };

  const value = {
    user,
    isLoggedIn,
    signup, // exposed to Signup.js
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 5. Custom hook to use it
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
