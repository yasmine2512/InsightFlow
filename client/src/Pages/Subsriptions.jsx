import { CreditCard, Check, TableProperties, Shield, BadgeCheck, Loader2, AlertCircle, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import axios from "axios"
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function SubscriptionPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Local subscription state, fetched from the server — not trusting
  // user.plan alone anymore, since it can drift from what Stripe says.
  const [subscription, setSubscription] = useState(null); // { plan, status, currentPeriodEnd }
  const [statusLoading, setStatusLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isPro = subscription?.plan === "pro";
  const isCancelling = subscription?.status === "cancelling";

  const fetchSubscription = useCallback(async () => {
    const token = user?.token;
    const id = user?.userId;
    if (!token || !id) return;

    try {
      const response = await axios.get(`${API_URL}/api/subscription/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscription(response.data);
     
      // Keep the auth context's plan in sync with the source of truth.
      updateUser({ plan: response.data.plan });
       console.log(user.plan)
    } catch (err) {
      console.error("Failed to fetch subscription status", err);
      setError("Couldn't load your subscription status.");
    } finally {
      setStatusLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token, user?.userId, API_URL]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Only redirect to the success page on a fresh, active (non-cancelling) Pro plan.
  // Someone who already cancelled and is just viewing this page mid-period
  // shouldn't be bounced away.
  // useEffect(() => {
  //   if (isPro && subscription?.status === "active" && !statusLoading) {
  //     navigate("/subscription-success");
  //   }
  // }, [isPro, subscription?.status, statusLoading, navigate]);

  const handleUpgrade = async () => {
    setError(null);
    setUpgradeLoading(true);
    const token = user?.token;
    const id = user?.userId;
    try {
      const response = await axios.post(
        `${API_URL}/api/subscription/${id}/create-checkout-session`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.url;
    } catch (err) {
      console.error("Failed to start checkout session", err);
      setError(
        err.response?.data?.message ||
        "Couldn't start checkout. Please try again."
      );
      setUpgradeLoading(false);
    }
  };

  const handleCancel = async () => {
    setError(null);
    setCancelLoading(true);
    const token = user?.token;
    const id = user?.userId;
    try {
      const response = await axios.post(
        `${API_URL}/api/subscription/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // User keeps Pro access until period end, so plan stays "pro" —
      // only the status changes to "cancelling".
      setSubscription((prev) => ({
        ...prev,
        status: "cancelling",
        currentPeriodEnd: response.data.currentPeriodEnd,
      }));
      setShowCancelConfirm(false);
    } catch (err) {
      console.error("Failed to cancel subscription", err);
      setError(
        err.response?.data?.message ||
        "Couldn't cancel your subscription. Please try again."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const handleResume = async () => {
    setError(null);
    setResumeLoading(true);
    const token = user?.token;
    const id = user?.userId;
    try {
      await axios.post(
        `${API_URL}/api/subscription/${id}/resume`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubscription((prev) => ({ ...prev, status: "active" }));
    } catch (err) {
      console.error("Failed to resume subscription", err);
      setError(
        err.response?.data?.message ||
        "Couldn't resume your subscription. Please try again."
      );
    } finally {
      setResumeLoading(false);
    }
  };

  const formattedPeriodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  if (statusLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-5">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 rounded-full bg-muted text-sm mb-2">
          <CreditCard className="w-4 h-4" />
          Pricing
        </div>

        <h1 className="text-xl font-bold mb-3">
          Simple, transparent pricing
        </h1>

        <p className="text-muted-foreground">
          {isCancelling
            ? `Your Pro plan stays active until ${formattedPeriodEnd || "the end of your billing period"}.`
            : isPro
            ? "You're on the Pro plan. Thanks for supporting us!"
            : "Start free. Upgrade when you're ready to scale."}
        </p>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isCancelling && (
        <div className="max-w-2xl mx-auto mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-3">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            Your subscription is set to cancel on {formattedPeriodEnd || "your next billing date"}.
            Changed your mind?{" "}
            <button
              onClick={handleResume}
              disabled={resumeLoading}
              className="underline font-medium disabled:opacity-50"
            >
              {resumeLoading ? "Resuming..." : "Resume subscription"}
            </button>
          </span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="border rounded-xl p-5 bg-card shadow-sm relative">
          {!isPro && (
            <div className="absolute top-4 right-4 bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" />
              Current Plan
            </div>
          )}

          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center mb-2">
            <CreditCard className="w-5 h-5" />
          </div>

          <h2 className="text-2xl font-bold">Free</h2>

          <p className="text-muted-foreground mt-2">
            Everything to run your business.
          </p>

          <div className="mt-4 mb-6">
            <span className="text-3xl font-bold">$0</span>
            <span className="text-muted-foreground"> / month</span>
          </div>

          <div className="space-y-2 mb-4">
            {[
              "Dashboard & KPIs",
              "Product management",
              "Order tracking",
              "Customer management",
              "Analytics & charts",
              "Search, filter & pagination",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-green-600" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full" disabled>
            {isPro ? "Included" : "Current Plan"}
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="border-2 border-primary rounded-xl p-5 bg-card shadow-lg relative">
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1">
            {isPro ? (
              <>
                <BadgeCheck className="w-3 h-3" />
                {isCancelling ? "Ending soon" : "Current Plan"}
              </>
            ) : (
              "Most Popular"
            )}
          </div>

          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center mb-4">
            <CreditCard className="w-5 h-5 text-white" />
          </div>

          <h2 className="text-xl font-bold">Pro</h2>

          <p className="text-muted-foreground mt-2">
            For businesses that move fast with data.
          </p>

          <div className="mt-4 mb-6">
            <span className="text-3xl font-bold">$9.99</span>
            <span className="text-muted-foreground"> / month</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-primary" />
              <span>Everything in Free</span>
            </div>

            <div className="pt-4 border-t">
              <p className="font-semibold mb-3">Excel Import</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <TableProperties className="w-4 h-4 text-primary" />
                  <span>Import products from Excel</span>
                </div>

                <div className="flex items-center gap-3">
                  <TableProperties className="w-4 h-4 text-primary" />
                  <span>Import orders from Excel</span>
                </div>

                <div className="flex items-center gap-3">
                  <TableProperties className="w-4 h-4 text-primary" />
                  <span>Import customers from Excel</span>
                </div>
              </div>
            </div>
          </div>

          {isPro ? (
            isCancelling ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={handleResume}
                disabled={resumeLoading}
              >
                {resumeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resuming...
                  </>
                ) : (
                  "Resume Subscription"
                )}
              </Button>
            ) : !showCancelConfirm ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Subscription
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  You'll keep Pro access until your current billing period ends.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelLoading}
                  >
                    Keep Pro
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Confirm Cancel"
                    )}
                  </Button>
                </div>
              </div>
            )
          ) : (
            <Button
              className="w-full gradient-primary border-0 text-primary-foreground"
              onClick={handleUpgrade}
              disabled={upgradeLoading}
            >
              {upgradeLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Upgrade to Pro →"
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-10 text-sm text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>
          Secured by Stripe · Cancel anytime · No hidden fees
        </span>
      </div>
    </div>
  );
}