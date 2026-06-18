import { CheckCircle2, Sparkles, ArrowRight, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SubscriptionSuccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user && user.plan !== "pro") {
      navigate("/subscriptions");
    }
  }, [user, navigate]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-5">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 rounded-full bg-muted text-sm mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Payment confirmed
        </div>

        <h1 className="text-xl font-bold mb-3">
          Welcome to Pro 🎉
        </h1>

        <p className="text-muted-foreground">
          Your subscription is active. You now have full access to every Pro feature.
        </p>
      </div>

      <div className="border-2 border-primary rounded-xl p-5 bg-card shadow-lg relative max-w-md mx-auto">
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
          Active
        </div>

        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center mb-4">
          <Sparkles className="w-5 h-5 text-white" />
        </div>

        <h2 className="text-xl font-bold">Pro Plan</h2>

        <p className="text-muted-foreground mt-2">
          $9.99 / month · Cancel anytime
        </p>

        <div className="space-y-3 mt-6 mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Dashboard, products, orders & customers</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Excel import for products, orders & customers</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Analytics & advanced search</span>
          </div>
        </div>

        <Button
          className="w-full gradient-primary border-0 text-primary-foreground"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-10 text-sm text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Secured by Stripe · A receipt has been sent to your email</span>
      </div>
    </div>
  );
}