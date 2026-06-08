import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isadmin: { type: Boolean, default: false}, 
  createdAt: { type: Date, default: Date.now },
  subscriptionId: { type: String }, // Stripe subscription
});
const User = mongoose.model("User", userSchema);
export default User;