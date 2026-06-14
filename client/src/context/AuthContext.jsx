import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate()
  useEffect(() => {
    // restore user from localStorage on page refresh
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const username = localStorage.getItem("username");
    if (token && userId) {
      setUser({ token, userId, isAdmin });
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userData._id);
    localStorage.setItem("isAdmin", userData.isadmin);
    localStorage.setItem("username", userData.name);
    setUser({ token, userId: userData._id, isAdmin: userData.isadmin });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("username");
    setUser(null);
    navigate(`/`);
    
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);