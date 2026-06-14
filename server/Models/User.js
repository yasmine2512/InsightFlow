import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  organizationName:{ type: String, default: "" },
  password: { type: String,default: ""},
  isadmin: { type: Boolean, default: false}, 
  createdAt: { type: Date, default: Date.now },
  subscriptionId: { type: String }, // Stripe subscription
  googleId: {type: String,default: ""}
});
const User = mongoose.model("User", userSchema);
export default User;