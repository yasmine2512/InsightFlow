import mongoose from "mongoose";
import { features } from "process";
const productSchema = new mongoose.Schema({
  organization: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: {type : String},
  features:{type: Array},
  image: {type:String ,default:"https://res.cloudinary.com/dxpglsreb/image/upload/v1785450112/vecteezy_empty-state-data-not-found-illustration_46952344_l3qxzn.jpg"}, 
  sku: {type : String,required: true,unique: true},
  createdAt: { type: Date, default: Date.now },
});
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;