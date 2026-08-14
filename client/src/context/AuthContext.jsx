import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // restore session
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
      setLoading(false);
  }, []);

  // LOGIN
  const login = (token, userData) => {
    console.log(userData)
    const fullUser = {
      token,
      userId: userData._id,
      isAdmin: userData.isadmin,
      username: userData.name,
      organization: userData.organizationName,
      plan: userData.plan,
    };

    setUser(fullUser);
    setLoading(false);
    localStorage.setItem("user", JSON.stringify(fullUser));
  };

  // UPDATE USER (VERY IMPORTANT FOR STRIPE)
  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user,loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);