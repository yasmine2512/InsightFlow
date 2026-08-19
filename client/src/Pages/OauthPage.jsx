import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
function OAuth() {
  const navigate = useNavigate();
  const {login}= useAuth();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
   const loadUser = async () => {
 
      const res = await api.get(`/api/auth/profile/${id}`);
      const user = res.data;
      login(user);
      navigate(`/dashboard`);
    };

    loadUser();
    
  }, []);
  return <div>Logging in...</div>;
}

export default OAuth;