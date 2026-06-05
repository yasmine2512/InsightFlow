import express from "express";
const router = express.Router();
import Order from "../Models/Order.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} from '../Middlewares/JWTauth.js'
import {gettotalcustomers,getTC} from "../Queries/dashboardQueries.js"
import{getAOV,getCRR,getgrowth,getCSD,getCLV} from "../Queries/customersQueries.js"

/** 
   * @desc total customers, average order value, customers retention rate,growth chart,Customer Spending Distribution , top customers,Customer Lifetime Value (CLV)
   * @route /api/customers/:id
   * @method GET
   * @access private
   */  
router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
const orgid = req.params.id;
const[totalcustomers,AOV,CRR,GC,CSD,TC,CLV] = await Promise.all([
gettotalcustomers(orgid),
getAOV(orgid),
getCRR(orgid),
getgrowth(orgid),
getCSD(orgid),
getTC(orgid),
getCLV(orgid)
])
return res.status(200).json({totalcustomers:totalcustomers,averageOrderValue:AOV,customerRetentionRate:CRR,grouth:GC,customersSpendingDistribution:CSD,topCustomers:TC,customerLiftimeValue:CLV})
}))







  

export default router; 