import { XCircle, CreditCard, ArrowLeft, Shield, LifeBuoy } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SubscriptionCancel() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 py-5">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 rounded-full bg-muted text-sm mb-2">
          <XCircle className="w-4 h-4 text-red-500" />
          Payment not completed
        </div>

        <h1 className="text-xl font-bold mb-3">
          Checkout was cancelled
        </h1>

        <p className="text-muted-foreground">
          No worries, you haven't been charged. You can try again whenever you're ready.
        </p>
      </div>

      <div className="border rounded-xl p-5 bg-card shadow-sm max-w-md mx-auto">
        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center mb-2">
          <CreditCard className="w-5 h-5" />
        </div>

        <h2 className="text-2xl font-bold">Still on Free</h2>

        <p className="text-muted-foreground mt-2">
          You're currently using the Free plan. Upgrade anytime to unlock Excel import and more.
        </p>

        <div className="flex flex-col gap-3 mt-6">
          <Button
            className="w-full gradient-primary border-0 text-primary-foreground"
            onClick={() => navigate("/subscriptions")}
          >
            Try Again
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-10 text-sm text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Secured by Stripe</span>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
        <LifeBuoy className="w-4 h-4" />
        <span>Having trouble? Contact support and we'll help you out.</span>
      </div>
    </div>
  );
}