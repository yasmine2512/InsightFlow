import express, { request } from "express";
const router = express.Router();
export default router; 
import asyncHandler from "express-async-handler";
import {
  verifyTokenAndAuthorization,
} from '../Middlewares/JWTauth.js'
import{getMGR,getOrders,getCustomers,getrevenuel7m,getBSP,getstockalert,getTC,getrecentorders} from "../Queries/dashboardQueries.js"
import { getOrdersChart } from "../Queries/ordersQueries.js";

/** 
 * @desc get best seller product with filter
 * @route  /api/dashboard/:id/bsp
 * @method GET
 * @access private
 */ 
router.get("/:id/bsp",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
const orgid= req.params.id;
const period = req.query.period;
const bsp = await getBSP(orgid,period);
return res.status(200).json(bsp);
}))


/** 
 * @desc get top customer with filter
 * @route  /api/dashboard/:id/tc
 * @method GET
 * @access private
 */ 
router.get("/:id/tc",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
const orgid= req.params.id;
const period = req.query.period;
const tc = await getTC(orgid,period);
return res.status(200).json(tc);
}))

/** 
 * @desc dashboards stats
 * @route  /api/dashboard/:id
 * @method GET
 * @access private
 */  
router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
const orgid = req.params.id;
const [MGR,orders,customers,revenuel7m,ordersthisweek,stockalert,recentorders] = await Promise.all([
getMGR(orgid),
getOrders(orgid),
getCustomers(orgid),
getrevenuel7m(orgid),
getOrdersChart(orgid),
getstockalert(orgid),
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

return res.status(200).json({revenue:currentR,revenugrowth:growthR,orders:currentO,
  ordersgrowth:growthO,customers:currentC,customersgrowth:growthC,revenuL7M:revenuel7m,
  ordersThisWeek:ordersthisweek,stockAlert:stockalert,recentOrders:recentorders});

  }))


