import mongoose from "mongoose";
const subscriptionSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  stripeSubscriptionId: String,
  status: String, // active/inactive/cancelled
  plan: String,
  createdAt: { type: Date, default: Date.now }, 
  currentPeriodEnd: Date,
});
const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;