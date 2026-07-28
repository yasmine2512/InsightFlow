import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderNumber: {type: Number,unique: true},
  customer :{ type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
      priceAtPurchase:{ type: Number }
    },
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "pending" }, 
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
},{ timestamps: true });
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order