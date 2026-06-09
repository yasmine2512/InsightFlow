import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: {
    type: String, 
    required: true,
  },

  seq: {
    type: Number,
    default: 1000,
  },
});

export const getNextOrderNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: "orderNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
};

export default mongoose.model("Counter", counterSchema);