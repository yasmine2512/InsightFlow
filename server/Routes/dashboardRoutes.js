import express, { request } from "express";
const router = express.Router();
export default router; 
import asyncHandler from "express-async-handler";
import User from "../Models/User.js"
import Product from "../Models/Product.js"
import Order from "../Models/Order.js"
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} from '../Middlewares/JWTauth.js'


/** 
   * @desc revenu,norders,nproducts,ncustomers,revenu in last 7 months(month),n ordersin week (day),5 best sellers products,stock alert,monthly recurring revenue (MRR),top 5 customers,recent orders,Monthly Growth Rate
   * @route  /api/dashboard/:organiztionid
   * @method GET
   * @access private
   */  

router.get("/:organizationId",verifyTokenAndAdmin,asyncHandler(async(req,res)=>{
  const orgid= req.params.organizationId;
  const sevenMonthsAgo = new Date();
  sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
  const lastweek = new Date();
  lastweek.setDate(lastweek.getDate() - 7);
const [ revenueResult, norders,nproducts,customerResult,revenuel7m,ordersthisweek,BSP,stockalert,TC,recentorders] = await Promise.all([
//revenu
Order.aggregate([{$match:{organization : new mongoose.Types.ObjectId(orgid)}},{$group: {_id: null,revenue: { $sum: "$totalPrice" } }}]),
//number of orders and products
Order.countDocuments({ organization: orgid }),
Product.countDocuments({ organization: orgid }) ,
//number of customers
Order.aggregate([{$match:{organization : new mongoose.Types.ObjectId(orgid)}},{$group:{_id : "$customer" }},{  $count: "customer"}]),
//revenu last 7 months
Order.aggregate([
  {$match:{organization : new mongoose.Types.ObjectId(orgid) ,createdAt: {$gte:sevenMonthsAgo}}},
  {$group:{
  _id: {year: { $year: "$createdAt" },
  month: { $month: "$createdAt" }},
  revenue: { $sum: "$totalPrice" }  }}, 
  {$project: {
      _id: 0,
      year: "$_id.year",
      month: "$_id.month",
      revenue: 1  }},
  {$sort: { year: 1, month: 1}}]),
 // number of orders this week
Order.aggregate([{$match:{organization : new mongoose.Types.ObjectId(orgid), createdAt : {$gte: lastweek}}},{$group:{_id :{$dayOfMonth :"$createdAt"},orders: { $sum: 1 } }},{$project:{_id:0,day:"$_id",orders:1}},{$sort:{day: 1}}]),
//5 best seller products
Order.aggregate([{$match:{organization : new mongoose.Types.ObjectId(orgid)}},{
  $lookup: {
    from: "products",
    localField: "_id",
    foreignField: "_id",
    as: "product"
  }
},{$unwind:"$products"},{$group:{_id: "$products.product",totalSold: { $sum: "$products.quantity" }}},
  { $sort: { totalSold: -1 } },
  { $limit: 5 }]),
//stock alert
Product.find({organization : orgid ,stock:{$lte:10}}),
//top 5 customers
Order.aggregate([{$match:{organization : new mongoose.Types.ObjectId(orgid)}},{$group:{_id: "$customer",numorders: {$sum: 1},totalSpent: { $sum: "$totalPrice" }}},
  {$lookup: {
      from: "customers",         
      localField: "_id",          
      foreignField: "_id",        
      as: "customer"}},
  { $unwind: "$customer"},
  {$project: {
      _id: 0,
      customerId: "$customer._id",
      name: "$customer.name",
      email: "$customer.email",
      numOrders: 1,
      totalSpent: 1}},{$sort :{numorders:-1}},{$limit : 5}]),
//recent orders
Order.find({organization : orgid}).sort({ createdAt: -1 }).limit(5),
]);
const revenue = revenueResult[0]?.revenue || 0;
const ncustomers = customerResult[0]?.customers || 0;
//Monthly Growth Rate
const currentMonth = revenuel7m[revenuel7m.length - 1];
const previousMonth = revenuel7m[revenuel7m.length - 2];
let monthlyGrowthRate = 0;
if (previousMonth) {
  if (previousMonth.revenue === 0) {
    monthlyGrowthRate =
      currentMonth.revenue > 0 ? 100 : 0;
  } else {
    monthlyGrowthRate =
      ((currentMonth.revenue - previousMonth.revenue) /
        previousMonth.revenue) * 100;
  }
}
res.status(200).json({totalOrders: norders ,totalProducts:nproducts ,revenue:revenue,totalcustomers:ncustomers,revenuL7M:revenuel7m,ordersThisWeek:ordersthisweek,bestSellerProducts:BSP,stockAlert:stockalert,topCustomers:TC,recentOrders:recentorders,MGR:monthlyGrowthRate});

  }))


  // for admin 
  /** 
   * @desc active subscriptions,monthly recuring,churn rate,avrg revenu user,top subscribers,plan distrbution
   * @route  /api/dashboard/:id
   * @method GET
   * @access private
   */ 