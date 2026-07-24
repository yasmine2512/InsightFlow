import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {return setError("Passwords do not match");}

    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password/${userId}/${token}`,
        {password});
      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
        console.log(err);
      setError(
        err.response?.data?.message ||
        "Something went wrong"
      );
    }
  };


  return (
    <div>
      <h2>Reset Password</h2>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e)=>setConfirmPassword(e.target.value)}
        />

        <button type="submit">
          Reset Password
        </button>

      </form>

    </div>
  );
}

export default ResetPassword;