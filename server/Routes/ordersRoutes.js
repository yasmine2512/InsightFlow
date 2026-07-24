import express from "express";
import mongoose from "mongoose";
import Order from "../Models/Order.js";
import Product from "../Models/Product.js";
import Customer from "../Models/Customer.js"
import Counter from "../Models/Counter.js";
import asyncHandler from "express-async-handler";
import { verifyTokenAndAdmin, verifyTokenAndAuthorization } from "../Middlewares/JWTauth.js";
import {getallOrders,gettotalOrders,getCompletedOrders,getOrdersByStatus,getordersperday} 
from "../Queries/ordersQueries.js";
import { getMGR,getOrders } from "../Queries/dashboardQueries.js";
import multer from "multer";
import xlsx from "xlsx";
const upload = multer({
  storage: multer.memoryStorage(),
});
const router = express.Router();


  const getNextOrderNumber = async () => {
    const counter = await Counter.findOneAndUpdate(
      { _id: "orderNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return counter.seq;
  };

/** 
   * @desc show all orders ,total orders,pending orders,completed orders,canceled orders per day 7,orders by status,Average Order Value (AOV)
   * @route /api/orders/:id
   * @method GET
   * @access private
   */  
router.get("/:id/stats",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
   const orgid = req.params.id;
   const[completedOrders,ordersbystatus,ordersperday,revenu,orders] = await Promise.all([
   getCompletedOrders(orgid),
   getOrdersByStatus(orgid),
   getordersperday(orgid),
   getMGR(orgid),
   getOrders(orgid)
   ]);
  const currentO = orders[0]?.currentOrders || 0;
  const previousO = orders[0]?.previousOrders || 0;
  const growthO = previousO === 0 ? 0 : ((currentO - previousO) / previousO) * 100;
  const currentR = revenu[0]?.currentRevenue || 0;
  const previousR = revenu[0]?.previousRevenue || 0;
  const currentCO = completedOrders[0]?.currentCOrders || 0;
  const previousCO = completedOrders[0]?.previousCOrders || 0;
  const CAOV = currentCO === 0 ? 0 : (currentR /currentCO);
  const PAOV= previousCO === 0 ?0 : (previousR/ previousCO);
  const AOVgrowth = PAOV === 0 ? 0 : ((CAOV - PAOV) / PAOV) * 100;
  const CFR = currentO === 0 ? 0 : (currentCO / currentO) * 100;
  const PFR = previousO === 0 ? 0 : (previousCO / previousO) * 100;
  const FRgrowth = PFR === 0 ? 0 : ((CFR - PFR) / PFR) * 100;
  
   return res.status(200).json({ordersTM:currentO,ordersgrowth:growthO,averageordervalue:CAOV,AOVgrowth:AOVgrowth,fulfillmentrate:CFR,FRgrowth:FRgrowth,ordersperday:ordersperday,ordersbystatus:ordersbystatus});
}));


router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
   const orgid = req.params.id;
   const allOrders = await getallOrders(orgid,req.query);
   return res.status(200).json({ orders :allOrders});
  }));

/** 
   * @desc create an order
   * @route /api/orders/:id
   * @method POST
   * @access private
   */  
router.post("/:id", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const orgid = req.params.id;
  const { products, totalPrice , customer} = req.body;
  const decremented = [];
let found = await Customer.findOne({organization: orgid,$or:[{email: customer.email},{phone: customer.phone}]});
if (!found){
found = await Customer.create({
    organization: orgid,
    ...customer
});
}
  for (const item of products) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (!updated) {
      for (const done of decremented) {
        await Product.findByIdAndUpdate(done.product, {
          $inc: { stock: done.quantity },
        });
      }
      return res.status(400).json({ message: `Not enough stock for product ${item.product}` });
    }

    decremented.push(item);
  }
  const order = new Order({
    organization: orgid,
    orderNumber: await getNextOrderNumber(),
    customer: found._id,
    products,
    totalPrice,
    status : "pending"
  });
  await order.save();
  return res.status(201).json({ message: "Order and customer created", order });
}));

 /** 
   * @desc deliver order
   * @route /api/orders/:id/:orderId/status
   * @method patch
   * @access private
   */  
router.patch("/:id/:orderId/status",verifyTokenAndAuthorization,asyncHandler(async (req, res) => {
    const { id, orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findOne({_id: orderId,organization: id,});
    if (!order) { return res.status(404).json({ message: "Order not found" });}
    if (order.status !== "pending") {
      return res.status(400).json({message: "Only pending orders can be updated",}); }
    if (status === "canceled") {
      await Promise.all(
      order.products.map(item => {
        return Product.findByIdAndUpdate(item.product,{
            $inc: {
              stock: item.quantity
            }}); }) );
    }
    order.status = status;
    await order.save();
    res.json({message: "Status updated",order,});
  })
);


/** 
   * @desc delete order
   * @route /api/orders/:id/orderId
   * @method DELETE
   * @access private
   */  
router.delete("/:id/:orderId", asyncHandler(async (req, res) => {
  const { id, orderId } = req.params;
  const order = await Order.findOne({_id: orderId,organization: id, });
  if (!order) {return res.status(404).json({ message: "Order not found" });}

  if (order.status === "completed") {
    return res.status(400).json({message: "Completed orders cannot be deleted"});
  }
  if (order.status === "pending") {
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });}
  }
  await Order.deleteOne({ _id: orderId });
  res.json({ message: "Order deleted successfully" });
}));

/** 
   * @desc create from excel
   * @route /api/orders/:id
   * @method POST
   * @access private
   */  
 router.post("/import/:id",verifyTokenAndAuthorization,upload.single("file"),
  asyncHandler(async (req, res) => {
    const orgId = new mongoose.Types.ObjectId(req.params.id);
    const workbook = xlsx.read(req.file.buffer, {type: "buffer",});
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    if (!rows.length) {return res.status(400).json({
        message: "Empty Excel file",
      });
    }
    const errors = [];
    const ordersMap = {};
    for (const row of rows) {
      const {orderRef,Fullname,email,phone,address,productSKU,quantity,date} = row;
      if (!orderRef || !email || !productSKU){
      errors.push({
      row,
      message: "Missing required fields",
      });
     continue;
    }
      if (!ordersMap[orderRef]) {
        ordersMap[orderRef] = {customer: {Fullname,email,phone,address,},
        date: parseExcelDate(date) || new Date() ,
        products: [],};
      }
      const parsedDate = date && !isNaN(parseExcelDate(date))? parseExcelDate(date):new Date();
      ordersMap[orderRef].orderDate = parsedDate;
      ordersMap[orderRef].products.push({productSKU,quantity: Number(quantity) || 1,});
    }
     
    const createdOrders = [];
    for (const orderRef in ordersMap) {
      const data = ordersMap[orderRef];
      try {
        let customer = await Customer.findOne({
          organization: orgId,
          email: data.customer.email,
        });
        if (!customer) {
          customer = await Customer.create({
            organization: orgId,
            name: data.customer.Fullname,
            email: data.customer.email,
            phone: data.customer.phone,
            address: data.customer.address,
            createdAt: data.date,
          });
        }
        const products = [];
        let totalPrice = 0;
        for (const item of data.products) {
          const product = await Product.findOne({
            organization: orgId,
            sku: item.productSKU,
          });
          if (!product) {
            errors.push({
              orderRef,
              message: `Product not found: ${item.productSKU}`,
            });
            continue;
          }
          const qty = item.quantity;
          products.push({
            product: product._id,
            quantity: qty,
            priceAtPurchase: product.price,
          });
          totalPrice += qty * product.price;
        }
        if (!products.length) continue;
        const order = await Order.create({
          organization: orgId,
          orderNumber: await getNextOrderNumber(),
          customer: customer._id,
          products,
          totalPrice,
          status: "pending",
          createdAt: data.date,
        });
        createdOrders.push(order);
      } catch (err) {
        errors.push({
          orderRef,
          message: err.message,
        });
      }
    }
    if (createdOrders.length === 0) {
  return res.status(400).json({
    message: "Import failed - no orders created",
    errors,
  });
}
    return res.status(201).json({
      message: "Import completed",
      created: createdOrders.length,
      failed: errors.length,
      errors,
    });
  })
);
function parseExcelDate(value) {
  if (!value) return null;
  if (typeof value === "number") {
    const utcDays = value - 25569; // Excel → Unix offset
    const utcSeconds = utcDays * 86400;
    const date = new Date(utcSeconds * 1000);
    return new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
}

export default router; 