import mongoose from "mongoose";
import Order from "./models/Order.js";
import Product from "./models/Product.js";
import Customer from "./models/Customer.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URI;

const orgId = "69d7d122f1b2c8ffe9d9c781";

const products = [
  "69ceeb9179cda7cbba90768f",
  "69ceeb9179cda7cbba907690",
  "69ceeb9179cda7cbba907691",
  "69d7d55256124041e7ce6d3d",
  "69d7d5e5e59b77afc5ef37d9",
  "69d8282864d1a3728ffc6c51",
  "69d828df64d1a3728ffc6c53",
  "69d96f8ff8a2a055e8324cbc",
  "69fbcb818c1a51ea5d0440af",
  "69fbd1dfcaa523e938c67593",
  "69fcb784a81eed4fdf905402"
];

const customersData = [
  {
    name: "Ahmed Ben",
    email: "ahmed@test.com",
    phone: "0550000001"
  },
  {
    name: "Sarah Ali",
    email: "sarah@test.com",
    phone: "0550000002"
  },
  {
    name: "Yacine DZ",
    email: "yacine@test.com",
    phone: "0550000003"
  },
  {
    name: "Lina Kara",
    email: "lina@test.com",
    phone: "0550000004"
  }
];

function randomDateThisMonth() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    Math.floor(Math.random() * now.getDate()) + 1
  );
}

function randomDateLastMonth() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    Math.floor(Math.random() * 28) + 1
  );
}

function randomStatus() {
  const statuses = [
    "completed",
    "completed",
    "completed",
    "pending",
    "canceled"
  ];

  return statuses[
    Math.floor(Math.random() * statuses.length)
  ];
}

async function seed() {
  await mongoose.connect(MONGO_URL);

  console.log("Connected");

  // clear previous demo orders
  await Order.deleteMany({
    organization: orgId
  });

  // create customers
  const customers = [];

  for (const c of customersData) {
    let customer = await Customer.findOne({
      email: c.email
    });

    if (!customer) {
      customer = await Customer.create({
        organization: orgId,
        ...c
      });
    }

    customers.push(customer);
  }

  const orders = [];

  // ---------- THIS MONTH ORDERS ----------
  for (let i = 0; i < 20; i++) {

    const customer =
      customers[Math.floor(Math.random() * customers.length)];

    const orderProducts = [];

    // product 0 becomes best seller
    const bestSellerBoost =
      Math.random() > 0.4;

    if (bestSellerBoost) {
      orderProducts.push({
        product: products[0],
        quantity: Math.floor(Math.random() * 3) + 2,
        priceAtPurchase: 120
      });
    }

    // random second product
    orderProducts.push({
      product:
        products[
          Math.floor(Math.random() * products.length)
        ],
      quantity: Math.floor(Math.random() * 3) + 1,
      priceAtPurchase: Math.floor(Math.random() * 200) + 50
    });

    const totalPrice = orderProducts.reduce(
      (sum, p) =>
        sum + p.quantity * p.priceAtPurchase,
      0
    );

    orders.push({
      organization: orgId,
      customer: customer._id,
      products: orderProducts,
      totalPrice,
      status: randomStatus(),
      createdAt: randomDateThisMonth(),
      updatedAt: randomDateThisMonth()
    });
  }

  // ---------- LAST MONTH ORDERS ----------
  for (let i = 0; i < 12; i++) {

    // Sarah becomes best customer
    const customer =
      i < 6
        ? customers[1]
        : customers[
            Math.floor(Math.random() * customers.length)
          ];

    const orderProducts = [
      {
        product:
          products[
            Math.floor(Math.random() * products.length)
          ],
        quantity: Math.floor(Math.random() * 4) + 1,
        priceAtPurchase:
          Math.floor(Math.random() * 200) + 50
      }
    ];

    const totalPrice = orderProducts.reduce(
      (sum, p) =>
        sum + p.quantity * p.priceAtPurchase,
      0
    );

    orders.push({
      organization: orgId,
      customer: customer._id,
      products: orderProducts,
      totalPrice,
      status: randomStatus(),
      createdAt: randomDateLastMonth(),
      updatedAt: randomDateLastMonth()
    });
  }

  await Order.insertMany(orders);

  // simulate stock reduction
  for (const order of orders) {
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity
          }
        }
      );
    }
  }

  console.log("Seed completed");
  process.exit();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
