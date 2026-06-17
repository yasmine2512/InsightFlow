import express from "express";
const router = express.Router();
import { verifyTokenAndAuthorization } from "../Middlewares/JWTauth.js";
import Stripe from "stripe";
import User from "../Models/User.js";
import Subscription from "../Models/Subscription.js";
import dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
/** 
   * @desc create subscription
   * @route /api/supscription
   * @method POST
   * @access public
   */  
router.post("/:id/create-checkout-session",verifyTokenAndAuthorization,async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      success_url:
        "http://localhost:5173/subscription-success",

      cancel_url:
        "http://localhost:5173/subscription-cancel",

      metadata: {
        userId: req.params.id,
      }
    });
    res.json({ url: session.url});
  }
);


router.post("/webhook",express.raw({ type: "application/json" }),async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body,sig,process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.log("❌ Webhook signature error:", err.message);
      return res.status(400).send( `Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log(session.metadata);
        console.log("WEBHOOK HIT");
        const userId = session.metadata?.userId;
        if (userId) {
        await User.findByIdAndUpdate(userId,
      {plan: "pro",stripeCustomerId: session.customer});
      await Subscription.create({
       user: userId,
       stripeSubscriptionId: session.subscription, 
       status: "active",
       plan: "pro",
      });
       }
        break;
      case "customer.subscription.deleted":
        const sub = event.data.object;
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        { status: "cancelled" }
      );
      await User.findOneAndUpdate(
        { stripeCustomerId: sub.customer },
        { plan: "free" }
      );
      break;
    }
    res.json({ received: true });
  }
);

/** 
   * @desc get subscription info
   * @route /api/auth/register
   * @method POST
   * @access public
   */  



/** 
   * @desc update subsciption
   * @route /api/auth/register
   * @method POST
   * @access public
   */  




/** 
   * @desc cancel subscription
   * @route /api/auth/register
   * @method POST
   * @access private
   */  
router.post("/:id/cancel", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.params.id,
      status: "active",
    });
    if (!subscription) {
      return res.status(404).json({ message: "No active subscription" });
    }
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    subscription.status = "cancelled";
    await subscription.save();
    await User.findByIdAndUpdate(req.params.id, {plan: "free"});
    res.json({ success: true });
  } catch (err) {
    console.error("Cancel subscription error:", err);
    res.status(500).json({ error: err.message });
  }
});
export default router; 