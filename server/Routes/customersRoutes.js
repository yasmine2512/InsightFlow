import express from "express";
const router = express.Router();
import Order from "../Models/Order.js";
import Customer from "../Models/Customer.js";
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
router.get("/:id/stats",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
const orgid = req.params.id;
const[customerscount,CRR,AC,CLV,CSD,CLM,TC] = await Promise.all([
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
const CAC = AC.current[0]?.value;
const PAC = AC.previous[0]?.value;
const GAC = PAC === 0 ? 0 : ((CAC - PAC) / PAC) * 100;

return res.status(200).json({totalcustomers:currentC,customerRetentionRate:currentCRR,CRRgrowth:CRRgrowth,activecustomers:CAC,ACgrowth:GAC,customerLiftimeValue:ALV,customersSpendingDistribution:CSD,newClast7month:CLM,topCustomers:TC});
}));

router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
const orgid = req.params.id;
const customers = await getallCustomers(orgid,req.query);
return res.status(200).json({customers});
}));


/**
 * @desc Create customer
 * @route POST /api/customers/:id
 * @access Private
 */
router.post("/:id",verifyTokenAndAuthorization,asyncHandler(async (req, res) => {
    const orgid = req.params.id;
    const {name,email,phone,address,} = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email && !phone) {
      return res.status(400).json({message: "Email or phone is required",});
    }
    const existing = await Customer.findOne({
      organization: orgid,
      $or: [...(email ? [{ email }] : []),...(phone ? [{ phone }] : []),],
    });
    if (existing) {
      return res.status(400).json({message:"Customer with this email or phone already exists",});
    }
  const customer = await Customer.create({organization: orgid,name,email,phone,address, });
    return res.status(201).json({message: "Customer created successfully",customer,});
  })
);

export default router; 

