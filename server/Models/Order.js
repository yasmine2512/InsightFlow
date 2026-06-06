import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer :{ type: mongoose.Schema.Types.ObjectId, ref: "Costumer", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
      priceAtPurchase:{ type: Number }
    },
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "pending" }, // pending/shipped/completed
  createdAt: { type: Date, default: Date.now },
},{ timestamps: true });
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order