import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!email) {return setError("Please enter your email");}

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`,{email});
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message ||"Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="forgot-password-page">
      <h2>Forgot Password?</h2>
      <p>
        Enter your email and we will send you a reset link.
      </p>
      {error && (
        <p style={{color:"red"}}>
          {error}
        </p>
      )}
      {message && (
        <p style={{color:"green"}}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <button 
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

      </form>
      <Link to="/login">
        Back to login
      </Link>

    </div>
  );
}

export default ForgotPassword;