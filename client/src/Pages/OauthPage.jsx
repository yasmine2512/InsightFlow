import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
function OAuth() {
  const navigate = useNavigate();
  const {login}= useAuth();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const id = params.get("id");
    const API_URL = import.meta.env.VITE_API_URL;
   const loadUser = async () => {
      if (!token) return navigate("/");
      localStorage.setItem("token", token);

      const res = await axios.get(`${API_URL}/api/auth/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data;
      login(token, user);
      navigate(`/dashboard`);
    };

    loadUser();
    
  }, []);
  return <div>Logging in...</div>;
}

export default OAuth;