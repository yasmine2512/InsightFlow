import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/Order.js";
import Product from "./models/Product.js";
import Customer from "./models/Customer.js";
import Counter from "./Models/Counter.js";

dotenv.config();

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
};

const seedMayOrders = async () => {
  const orgId = "69d7d122f1b2c8ffe9d9c781";

  
  // const products = await Product.find({ organization: orgId });
  // const customers = await Customer.find({ organization: orgId });

  // const startDate = new Date("2026-05-01");
  // const endDate = new Date("2026-05-08");

  // for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {

  //   const ordersPerDay = 1;

  //   for (let i = 0; i < ordersPerDay; i++) {

  //     const customer = random(customers);

  //     const selectedProducts = [];
  //     let totalPrice = 0;

  //     const itemsCount = Math.floor(Math.random() * 3) + 1;

  //     for (let j = 0; j < itemsCount; j++) {

  //       const product = random(products);
  //       const quantity = Math.floor(Math.random() * 2) + 1;

  //       if (!product || product.stock < quantity) continue;

  //       product.stock -= quantity;
  //       await product.save();

  //       selectedProducts.push({
  //         product: product._id,
  //         quantity,
  //         priceAtPurchase: product.price
  //       });

  //       totalPrice += product.price * quantity;
  //     }

  //     if (selectedProducts.length === 0) continue;

  //     await Order.create({
  //       organization: orgId,
  //       customer: customer._id,
  //       products: selectedProducts,
  //       totalPrice,
  //       status: random(["pending", "completed", "completed"]),
  //       createdAt: new Date(d)
  //     });
  //   }
  // }

  console.log("✅ May orders seeded successfully");
};

const run = async () => {
  try {
    await connectDB();
    await seedMayOrders();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

run();

