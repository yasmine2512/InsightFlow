import express from "express";
import Order from "../Models/Order.js";
import Product from "../Models/Product";
import asyncHandler from "express-async-handler";
import { verifyTokenAndAdmin, verifyTokenAndAuthorization } from "../Middlewares/JWTauth.js";
import {getallOrders,gettotalOrders,getcompletedOrders,getordersperday} 
from "../queries/ordersQueries.js";
import { getrevenueResult } from "../queries/dashboardQueries.js";
const router = express.Router();
export default router; 

/** 
   * @desc show all orders ,total orders,pending orders,completed orders,canceled orders per day 7,orders by status,Average Order Value (AOV)
   * @route /api/orders/:organisationId
   * @method GET
   * @access private
   */  
router.get("/:organizationId",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
   const orgid = req.params.organizationId;
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
   * @route /api/orders/:organizationId
   * @method POST
   * @access private
   */  
router.post("/:organizationId", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const { products, totalPrice , customer} = req.body;
  const decremented = [];

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
    organization: req.params.organizationId,
    customer,
    products,
    totalPrice,
    status : "pending"
  });

  return res.status(201).json({ message: "Order created", order });
}));

 
/** 
   * @desc check the order
   * @route /api/orders/:orderId/complete
   * @method PUT
   * @access private
   */  
router.put("/:orderId/complete",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
   const orderId = req.params.orderId;
   const order = await Order.findByIdAndUpdate(orderId,{
      $set:{status: "completed"}
   },{new : true});
   await order.save();
   if (!order) return res.status(404).json({ message: "Order not found" });
   return res.json({ message: "updated to completed", order });
}))
 
/** 
   * @desc deliver order
   * @route /api/orders/:orderId/cancel
   * @method POST
   * @access private
   */  
  router.put("/:orderId/cancel",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
   const orderId = req.params.orderId;
   const order = await Order.findByIdAndUpdate({ _id: req.params.orderId, 
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