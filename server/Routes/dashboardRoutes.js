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
import{getMGR,getOrders,getCustomers,getrevenuel7m,getBSP,getstockalert,getTC,getrecentorders} from "../Queries/dashboardQueries.js"
import{getordersperday} from "../Queries/ordersQueries.js"

/** 
 * @desc dashboards stats
 * @route  /api/dashboard/:id
 * @method GET
 * @access private
 */  
router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
  const orgid= req.params.id;

const [MGR,orders,customers,revenuel7m,ordersthisweek,BSP,stockalert,TC,recentorders] = await Promise.all([
getMGR(orgid),
getOrders(orgid),
getCustomers(orgid),
getrevenuel7m(orgid),
getordersperday(orgid),
getBSP(orgid),
getstockalert(orgid),
getTC(orgid),
getrecentorders(orgid)
]);
const currentR = MGR[0]?.currentRevenue || 0;
const previousR = MGR[0]?.previousRevenue || 0;
const growthR = previousR === 0 ? 0 : ((currentR - previousR) / previousR) * 100;
const currentO = orders[0]?.currentOrders || 0;
const previousO = orders[0]?.previousOrders || 0;
const growthO = previousO === 0 ? 0 : ((currentO - previousO) / previousO) * 100;
const currentC = customers[0]?.currentCustomers || 0;
const previousC = customers[0]?.previousCustomers || 0;
const growthC = previousC === 0 ? 0 : ((currentC - previousC) / previousC) * 100;

return res.status(200).json({revenue:currentR,revenugrowth:growthR,orders:currentO,ordersgrowth:growthO,customers:currentC,customersgrowth:growthC,revenuL7M:revenuel7m,ordersThisWeek:ordersthisweek,bestSellerProducts:BSP,stockAlert:stockalert,topCustomers:TC,recentOrders:recentorders});

  }))

