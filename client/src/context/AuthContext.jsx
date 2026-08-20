import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // restore session
  useEffect(() => {
    async function checkUserSession() {
      try {
        const response = await api.get(`/api/auth/me`);
        const userData = response.data.user;
        setUser({
          userId: userData._id,
          email: userData.email,
          isAdmin: userData.isadmin,
          username: userData.name,
          organization: userData.organizationName,
          plan: userData.plan,
        });
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkUserSession();
  }, []);

  // LOGIN
  const login = (userData) => {
    const fullUser = {
      userId: userData._id,
      email: userData.email,
      isAdmin: userData.isadmin,
      username: userData.name,
      organization: userData.organizationName,
      plan: userData.plan,
    };

    setUser(fullUser);
    setLoading(false);
    localStorage.setItem("user", JSON.stringify(fullUser));
  };

  const logout = async () => {
  try {
    await api.post(`/api/auth/logout`);
  } catch (err) {
    console.error("Logout failed", err);
  }
  setUser(null);
  navigate("/");
};

  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user,loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);