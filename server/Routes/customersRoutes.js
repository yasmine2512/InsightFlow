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
import {getCustomers,getTC} from "../Queries/dashboardQueries.js"
import{gettotalcustomers,getallCustomers,getCRR,getActiveCustomers,getCLM,getAvgCLV,getCSD,getCLV} from "../Queries/customersQueries.js"

/** 
   * @desc total customers,customers retention rate,growth chart,Customer Spending Distribution , top customers,Customer Lifetime Value (CLV)
   * @route /api/customers/:id
   * @method GET
   * @access private
   */  
router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
const orgid = req.params.id;
const[customers,CRR,AC,CLV,CSD,CLM,TC] = await Promise.all([
getCustomers(orgid),
getCRR(orgid),
getActiveCustomers(orgid),
getCLV(orgid),
getCSD(orgid),
getCLM(orgid),
getTC(orgid),
]);
return res.status(200).json({totalcustomers:totalcustomers,customerRetentionRate:CRR,activecustomers:AC,customerLiftimeValue:CLV,customersSpendingDistribution:CSD,newClast7month:CLM,topCustomers:TC})
}));

export default router; 