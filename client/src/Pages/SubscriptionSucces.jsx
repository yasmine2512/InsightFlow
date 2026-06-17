import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
     const { user,updateUser} = useAuth();
     const [localUser, setlocalUser] = useState(null);
  useEffect(() => {
    setlocalUser(user);
  }, [user]);

  async function cancelSubscription() {
      const token = user?.token;
     const userId = user?.userId;
    await axios.post(
      `${API_URL}/api/subscription/${userId}/cancel`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

     const updated = { ...localUser, plan: "free" };
     updateUser({ plan: "free" });
    setLocalUser(updated);
  }

  if (!localUser) return <div>Loading...</div>;

  return (
    <div className="text-center mt-20">
      {localUser.plan === "pro" ? (
        <>
          <h1 className="text-3xl font-bold text-green-600">
            You are on Pro 
          </h1>

          <p className="mt-2">
            Your subscription is active.
          </p>

          <button
            onClick={cancelSubscription}
            className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
          >
            Cancel Subscription
          </button>
        </>
      ) : (
        <h1>Processing payment...</h1>
      )}
    </div>
  );
}