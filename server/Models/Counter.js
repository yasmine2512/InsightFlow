import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 999,
  },
});
counterSchema.index(
  { organization: 1, type: 1 },
  { unique: true }
);
export default mongoose.model("Counter", counterSchema);