import React, { createContext, useContext, useState, useEffect } from "react";

// Create context that will hold authentication related data
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // Varaibles, manage token and user
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isUser, setIsUser] = useState(null);

  // useEffect to run on initial component mount
  useEffect(() => {
    // Get token and user from local storage
    const storedToken = localStorage.getItem("userToken");
    const storedUser = localStorage.getItem("userData");

    // If token exisits in storage, update token
    if (storedToken) {
      setToken(storedToken);
    }

    // If user exists in storage, update user
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handles login of user, updating token, user data, and localStorage
  const login = (responseData) => {
    //console.log(responseData.company_id);

    // Store entered credentials as variables
    const { token, user, isUser } = responseData;
    localStorage.setItem("userToken", token);
    localStorage.setItem("userData", JSON.stringify(user));
    localStorage.setItem("isUser", isUser);
    setToken(token);
    setUser(user);
    setIsUser(isUser);
  };

  /*
  // Handles login of team member, updating token, user data, and localStorage
  const loginTeam = (responseData) => {
    //console.log(responseData.company_id);
    
    // Store entered credentials as variables
    const { token, user } = responseData;
    localStorage.setItem('userToken', token);
    localStorage.setItem('teamData', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };
  */

  // Handles logout, clears token, user data, and localStorage
  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    setToken(null);
    setUser(null);
  };

  // Returns authentication values to other child components
  return (
    <AuthContext.Provider
      value={{ token, user, isUser, login, /*loginTeam,*/ logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Access the authentication values from components
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export AuthProvider and useAuth for use in other components
export { AuthProvider, useAuth };
