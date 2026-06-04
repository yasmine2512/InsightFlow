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
import{getrevenueResult, getnorders,getnproducts,getcustomerResult,getrevenuel7m,getordersthisweek,getBSP,getstockalert,getTC,getrecentorders} from "../queries/dashboardQueries.js"

/** 
 * @desc revenu,norders,nproducts,ncustomers,revenu in last 7 months(month),n ordersin week (day),5 best sellers products,stock alert,monthly recurring revenue (MRR),top 5 customers,recent orders,Monthly Growth Rate
 * @route  /api/dashboard/:organiztionid
 * @method GET
 * @access private
 */  
router.get("/:organizationId",verifyTokenAndAdmin,asyncHandler(async(req,res)=>{
  const orgid= req.params.organizationId;

const [ revenueResult, norders,nproducts,customerResult,revenuel7m,ordersthisweek,BSP,stockalert,TC,recentorders] = await Promise.all([
getrevenueResult(orgid),
getnorders(orgid),
getnproducts(orgid),
getcustomerResult(orgid),
getrevenuel7m(orgid),
getordersthisweek(orgid),
getBSP(orgid),
getstockalert(orgid),
getTC(orgid),
getrecentorders(orgid)
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
return res.status(200).json({totalOrders: norders ,totalProducts:nproducts ,revenue:revenue,totalcustomers:ncustomers,revenuL7M:revenuel7m,ordersThisWeek:ordersthisweek,bestSellerProducts:BSP,stockAlert:stockalert,topCustomers:TC,recentOrders:recentorders,MGR:monthlyGrowthRate});

  }))


  // for admin 
  /** 
   * @desc active subscriptions,monthly recuring,churn rate,avrg revenu user,top subscribers,plan distrbution
   * @route  /api/dashboard/:id
   * @method GET
   * @access private
   */ 