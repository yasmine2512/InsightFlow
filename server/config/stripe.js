import Stripe from "stripe";

let stripe;
const getStripe = () => {
  if (!stripe) {
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}
router.post("/create-checkout-session", verifyToken, async (req, res) => {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url:
      "http://localhost:5173/subscription-success?session_id={CHECKOUT_SESSION_ID}",

    cancel_url:
      "http://localhost:5173/subscription-cancel",
  });
  res.json({
    url: session.url,
  });
});