import express from "express";
import mongoose from "mongoose";
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

const toObjectId = (id) =>
  new mongoose.Types.ObjectId(id);

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

return res.status(200).json({newcustomers:currentC,NCgrowth:growthC,customerRetentionRate:currentCRR,CRRgrowth:CRRgrowth,activecustomers:CAC,ACgrowth:GAC,customerLiftimeValue:ALV,customersSpendingDistribution:CSD,newClast7month:CLM,topCustomers:TC});
}));

router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
const orgid = req.params.id;
const customers = await getallCustomers(orgid,req.query);
return res.status(200).json({customers});
}));


/** 
   * @desc create customer
   * @route /api/customers/:id
   * @method POST
   * @access private
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
    const cleanEmail = email.trim().toLowerCase() || "";
  const customer = await Customer.create({organization: orgid,name,email:cleanEmail,phone,address, });
    return res.status(201).json({message: "Customer created successfully"});
  })
);
/** 
   * @desc edit customer
   * @route /api/customers/:id/:customerId
   * @method PUT
   * @access private
   */  
router.put( "/:id/:customerId", verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
    const { id, customerId } = req.params;
    const { name, email, phone, address } = req.body;
    const customer = await Customer.findOne({_id:toObjectId(customerId) ,
      organization:toObjectId(id)});
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }
    if (email) {
      const existingEmail = await Customer.findOne({
        organization: toObjectId(id),
        email,
        _id: { $ne: toObjectId(customerId) },
      });
      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists",
        });}}
    customer.name = name || customer.name;
    customer.email = email.trim().toLowerCase() || customer.email;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    await customer.save();
    res.status(200).json({message: "Customer updated successfully"});
  })
);
/** 
   * @desc delete customer
   * @route /api/customers/:id/:customerId
   * @method GET
   * @access private
   */  
router.delete("/:id/:customerId",verifyTokenAndAuthorization,asyncHandler(async (req, res) => {
    const orgId =toObjectId(req.params.id);
    const customerId =toObjectId(req.params.customerId);
    const customer = await Customer.findOne({_id: customerId,organization: orgId,});
    if (!customer) {
      return res.status(404).json({message: "Customer not found",});
    }
    const usedInOrders = await Order.exists({organization: orgId,customer: customerId,});
    if (usedInOrders) {
      return res.status(400).json({
        message:"Cannot delete customer because they have existing orders"});
    }
    await Customer.deleteOne({_id: customerId,organization: orgId,});
    return res.status(200).json({message: "Customer deleted successfully"});
  })
);

export default router; 

