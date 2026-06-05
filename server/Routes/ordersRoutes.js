import express from "express";
import Order from "../Models/Order.js";
import Product from "../Models/Product";
import Customer from "../Models/Customer.js"
import asyncHandler from "express-async-handler";
import { verifyTokenAndAdmin, verifyTokenAndAuthorization } from "../Middlewares/JWTauth.js";
import {getallOrders,gettotalOrders,getcompletedOrders,getordersperday} 
from "../Queries/ordersQueries.js";
import { getrevenueResult } from "../Queries/dashboardQueries.js";
import { forEachPrimitiveInScene } from "gltf-pipeline/lib/NodeHelpers.js";
const router = express.Router();
export default router; 

/** 
   * @desc show all orders ,total orders,pending orders,completed orders,canceled orders per day 7,orders by status,Average Order Value (AOV)
   * @route /api/orders/:id
   * @method GET
   * @access private
   */  
router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
   const orgid = req.params.id;
   const[allOrders,totalOrders,completedOrders,ordersperday,revenueResult] = await Promise.all([
   getallOrders(orgid),
   gettotalOrders(orgid),
   getcompletedOrders(orgid),
   getordersperday(orgid),
   getrevenueResult(orgid)
   ]);

   const revenue = revenueResult[0]?.revenue || 0;
   const AOV =
  completedOrders === 0 ? 0 : revenue / completedOrders;
   return res.status(200).json({ orders :allOrders ,totalOrders :totalOrders,ordersperday:ordersperday,AverageOrderValue:AOV});
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
    customer: found._id,
    products,
    totalPrice,
    status : "pending"
  });
  await order.save();
  return res.status(201).json({ message: "Order and customer created", order });
}));

 
/** 
   * @desc check the order
   * @route /api/orders/:id/:orderId/complete
   * @method PUT
   * @access private
   */  
router.put("/:id/:orderId/complete",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
   const orderId = req.params.orderId;
   const order = await Order.findOneAndUpdate(orderId,{
      $set:{status: "completed"}
   },{new : true});
   await order.save();
   if (!order) return res.status(404).json({ message: "Order not found" });
   return res.json({ message: "updated to completed", order });
}))
 
/** 
   * @desc deliver order
   * @route /api/orders/:id/:orderId/cancel
   * @method POST
   * @access private
   */  
  router.put("/:id/:orderId/cancel",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
   const orderId = req.params.orderId;
   const order = await Order.findOneAndUpdate({ _id: req.params.orderId, 
      status: { $ne: "canceled" }},{
      $set:{status: "canceled",}
   },{new : true});
     if (!order) {
      return res.status(404).json({
        message:
          "Order not found or already canceled"
      });
    }
   await Promise.all(
      order.products.map(item => {
        return Product.findByIdAndUpdate(item.product,{
            $inc: {
              stock: item.quantity
            }}); }) );

   return res.json({ message: "updated to canceled", order });
}))

/** 
   * @desc create from exel
   * @route /api/orders/:id
   * @method POST
   * @access private
   */  
  router.post("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
   const orgid = req.params.id;
  
  
  }));