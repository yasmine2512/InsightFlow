import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      sparse: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String
    },
  },
  { timestamps: true });
customerSchema.index(
  { organization: 1, phone: 1 },
  { unique: true, sparse: true }
);

customerSchema.index(
  { organization: 1, email: 1 },
  { unique: true, sparse: true }
);
const Customer = mongoose.model("Customer", customerSchema);
export default Customer;