import { CreditCard, Check, TableProperties, Shield } from "lucide-react";
import { Button } from "../components/ui/button";

export default function SubscriptionPage() {
  const handleUpgrade = () => {
    // Stripe checkout here
    console.log("Upgrade to Pro");
  };

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
          Start free. Upgrade when you're ready to scale.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="border rounded-xl p-5 bg-card shadow-sm">
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

          <Button variant="outline" className="w-full">
            Current Plan
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="border-2 border-primary rounded-xl p-5 bg-card shadow-lg relative">
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
            Most Popular
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

          <Button
            className="w-full gradient-primary border-0 text-primary-foreground"
            onClick={handleUpgrade}
          >
            Upgrade to Pro →
          </Button>
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