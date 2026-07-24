import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { KeyRound } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="relative bg-card border border-border rounded-2xl shadow-xl p-8 w-full max-w-md">
        
        {/* Icon Header */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
          <KeyRound size={22} className="text-primary" />
        </div>

        <h2 className="text-xl font-semibold text-center mb-1">Reset Password</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Please enter your new password below.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Reset Password
          </button>
        </form>

      </div>
    </div>
  );
}

export default ResetPassword;