import express from "express";
const router = express.Router();
import Stripe from "stripe";
import User from "../Models/User";

router.post("/webhook",express.raw({ type: "application/json" }),async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body,sig,process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(
        `Webhook Error: ${err.message}`
      );
    }
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const userId = session.metadata.userId;
        await User.findByIdAndUpdate(
          userId,
          {subscriptionPlan: "pro",stripeCustomerId: session.customer}
        );
        break;
      case "customer.subscription.deleted":
     await User.findOneAndUpdate(
     {stripeCustomerId:event.data.object.customer},
     {subscriptionPlan: "free" }
     );
      break;  
    }
    res.json({ received: true });
  }
);