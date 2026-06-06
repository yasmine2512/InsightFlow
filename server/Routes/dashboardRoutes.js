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
import{getrevenueResult,getMGR, getnorders,getnproducts,gettotalcustomers,getrevenuel7m,getordersthisweek,getBSP,getstockalert,getTC,getrecentorders} from "../Queries/dashboardQueries.js"

/** 
 * @desc revenu,norders,nproducts,ncustomers,revenu in last 7 months(month),n ordersin week (day),5 best sellers products,stock alert,monthly recurring revenue (MRR),top 5 customers,recent orders,Monthly Growth Rate
 * @route  /api/dashboard/:id
 * @method GET
 * @access private
 */  
router.get("/:id",verifyTokenAndAdmin,asyncHandler(async(req,res)=>{
  const orgid= req.params.id;

const [ revenueResult,MGR, norders,nproducts,ncustomers,revenuel7m,ordersthisweek,BSP,stockalert,TC,recentorders] = await Promise.all([
getrevenueResult(orgid),
getMGR(orgid),
getnorders(orgid),
getnproducts(orgid),
gettotalcustomers(orgid),
getrevenuel7m(orgid),
getordersthisweek(orgid),
getBSP(orgid),
getstockalert(orgid),
getTC(orgid),
getrecentorders(orgid)
]);
const revenue = revenueResult[0]?.revenue || 0;
const current = MGR[0]?.currentRevenue || 0;
const previous = MGR[0]?.previousRevenue || 0;

const growth = previous === 0 ? 0 : ((current - previous) / previous) * 100;
return res.status(200).json({totalOrders: norders ,totalProducts:nproducts ,revenue:revenue,totalcustomers:ncustomers,revenuL7M:revenuel7m,ordersThisWeek:ordersthisweek,bestSellerProducts:BSP,stockAlert:stockalert,topCustomers:TC,recentOrders:recentorders,MGR:growth});

  }))


  // for admin 
  /** 
   * @desc active subscriptions,monthly recuring,churn rate,avrg revenu user,top subscribers,plan distrbution
   * @route  /api/dashboard/:id
   * @method GET
   * @access private
   */ 