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
import{gettotalcustomers,getallCustomers,getCRR,getActiveCustomers,getCLM,getAvgCLV,getCSD} from "../Queries/customersQueries.js"

/** 
   * @desc total customers,customers retention rate,growth chart,Customer Spending Distribution , top customers,Customer Lifetime Value (CLV)
   * @route /api/customers/:id
   * @method GET
   * @access private
   */  
router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
const orgid = req.params.id;
const[customers,customerscount,CRR,AC,CLV,CSD,CLM,TC] = await Promise.all([
getallCustomers(orgid,req.query),  
getCustomers(orgid),
getCRR(orgid),
getActiveCustomers(orgid),
getAvgCLV(orgid),
getCSD(orgid),
getCLM(orgid),
getTC(orgid),
]);
const currentC = customerscount[0]?.currentCustomers || 0;
const previousC = customerscount[0]?.previousCustomers || 0;
const growthC = previousC === 0 ? 0 : ((currentC - previousC) / previousC) * 100;
const ALV = CLV[0]?.avgCLV || 0;
const currentCRR = CRR[0]?.current[0]?.returningCustomers || 0;
const previousCRR = CRR[0]?.previous[0]?.returningCustomers || 0;
const CRRgrowth = previousCRR === 0 ? 0 : ((currentCRR - previousCRR) / previousCRR) * 100;

return res.status(200).json({customers:customers,totalcustomers:currentC,customerRetentionRate:currentCRR,CRRgrowth:CRRgrowth,activecustomers:AC,customerLiftimeValue:ALV,customersSpendingDistribution:CSD,newClast7month:CLM,topCustomers:TC});
}));

export default router; 