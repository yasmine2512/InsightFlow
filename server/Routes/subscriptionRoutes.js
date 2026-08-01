import express from "express";
const router = express.Router();
import { verifyTokenAndAuthorization } from "../Middlewares/JWTauth.js";
import Stripe from "stripe";
import User from "../Models/User.js";
import Subscription from "../Models/Subscription.js";
import dotenv from "dotenv";
dotenv.config();

let stripe;
const getStripe = () => {
  if (!stripe) {
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

/**
 * @desc create subscription checkout session
 * @route /api/subscription/:id/create-checkout-session
 * @method POST
 * @access private
 */
router.post("/:id/create-checkout-session",verifyTokenAndAuthorization,async (req, res) => {
    const stripe = getStripe();
    try {
      const { id } = req.params;
      const existing = await Subscription.findOne({organization: id,status: "active",}).lean();
      if (existing) {return res.status(409).json({ 
        message: "You already have an active subscription." });}
      const user = await User.findById(id).lean();
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        customer: user.stripeCustomerId || undefined,
        customer_email: user.stripeCustomerId ? undefined : user.email,
        success_url: `${process.env.CLIENT_URL}/subscription-success`,
        cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
        metadata: {
          userId: id,
        },
      });
      res.json({ url: session.url });
    } catch (err) {
      console.error("Create checkout session error:", err.message);
      res.status(500)
        .json({ message: "Couldn't start checkout. Please try again." });
    }
  }
);

/**
 * @desc Stripe webhook handler
 * @route /api/subscription/webhook
 * @method POST
 * @access public (verified via Stripe signature)
 */
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(" Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata?.userId;
          if (userId) {
            await User.findByIdAndUpdate(userId, {
              plan: "pro",
              stripeCustomerId: session.customer,
            });
            await Subscription.findOneAndUpdate(
              { stripeSubscriptionId: session.subscription },
              {
                organization: userId,
                stripeSubscriptionId: session.subscription,
                status: "active",
                plan: "pro",
              },
              { upsert: true, returnDocument: "after" }
            );
          }
          break;}
        case "customer.subscription.updated": {
          
          const sub = event.data.object;
          const currentPeriodEnd =sub.items?.data?.[0]?.current_period_end;
          const status = sub.cancel_at_period_end
            ? "cancelling"
            : sub.status === "active"
            ? "active"
            : sub.status;
          await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: sub.id },
            { status,
              currentPeriodEnd: currentPeriodEnd
                ? new Date(currentPeriodEnd * 1000)
                : undefined,
            }
          );
          break;
        }
        case "customer.subscription.deleted": {
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
        default:
          break;
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook handler error:", err.message);
      res.status(500).json({ message: "Webhook processing failed." });
    }
  }
);

/**
 * @desc get current subscription info for a user
 * @route /api/subscription/:id
 * @method GET
 * @access private
 */
router.get("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      organization: req.params.id,
    }).sort({ createdAt: -1 }) .lean();
    if (!subscription) {
      return res.json({ plan: "free", status: null });
    }
    res.json({
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd || null,
    });
  } catch (err) {
    console.error("Get subscription error:", err.message);
    res.status(500).json({ message: "Couldn't fetch subscription info." });
  }
});

/**
 * @desc cancel subscription at the end of the current billing period
 * @route /api/subscription/:id/cancel
 * @method POST
 * @access private
 */
router.post("/:id/cancel", verifyTokenAndAuthorization, async (req, res) => {
  const stripe = getStripe();
  try {
    const subscription = await Subscription.findOne({
      organization: req.params.id,
      status: "active",
    });
    if (!subscription) {
      return res.status(404).json({ message: "No active subscription." });
    }
    const updatedStripeSub = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );
    const currentPeriodEnd =updatedStripeSub.items?.data?.[0]?.current_period_end;
    subscription.status = "cancelling";
    subscription.currentPeriodEnd = new Date(currentPeriodEnd * 1000);
    await subscription.save();
    res.json({success: true,
      message: "Subscription will end at the close of your billing period.",
      currentPeriodEnd: subscription.currentPeriodEnd,
    });
  } catch (err) {
    console.error("Cancel subscription error:", err.message);
    res
      .status(500)
      .json({ message: "Couldn't cancel your subscription. Please try again." });
  }
});
/**
 * @desc undo a pending cancellation (resume before period end)
 * @route /api/subscription/:id/resume
 * @method POST
 * @access private
 */
router.post("/:id/resume", verifyTokenAndAuthorization, async (req, res) => {
  const stripe = getStripe();
  try {
    const subscription = await Subscription.findOne({
      organization: req.params.id,
      status: "cancelling",
    });
    if (!subscription) {
      return res.status(404).json({ message: "No pending cancellation found." });
    }
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
    subscription.status = "active";
    await subscription.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Resume subscription error:", err.message);
    res
      .status(500)
      .json({ message: "Couldn't resume your subscription. Please try again." });
  }
});

export default router;