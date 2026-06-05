import mongoose from "mongoose";
import Order from "../Models/Order";
import Customer from "../Models/Customer";
import {getnorders,getrevenueResult} from "./dashboardQueries"
const toObjectId = (id) =>
  new mongoose.Types.ObjectId(id);


//average order value
export const getAOV = async(orgid)=>{
const [ revenueResult, norders] = await Promise.all([
getrevenueResult(orgid),
getnorders(orgid)
]);
const revenue = revenueResult[0]?.revenue || 0;
if(norders != 0){return revenue/norders} else {return 0}

}
//customers retention rate
export const getCRR = async(orgid)=>{
 const result = await Order.aggregate([
    {$match:{organization: toObjectId(orgid),status: "completed" }},
    {$group: { _id: "$customer", orderCount: { $sum: 1 }}},
    {$group: {_id: null,totalCustomers: { $sum: 1 },returningCustomers: {
          $sum: {$cond: [  { $gte: ["$orderCount", 2] },1,0]} }} },
    {$project: {_id: 0,retentionRate: {$divide: ["$returningCustomers","$totalCustomers"]} }}
]);

  return result[0] || {
    retentionRate: 0
  };
}
//new customers last 7 months
export const getgrowth = async(orgid)=>{
const sevenMonthsAgo = new Date();
sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
return Customer.aggregate([
    {$match:{organization:toObjectId(orgid),createdAt:{$gte:sevenMonthsAgo}}},
    {$group:{_id:{year: { $year: "$createdAt" },month: { $month: "$createdAt" }},
            totalcustomers : {$sum:1}}},
    {$project:{_id:1 ,totalcustomers :1}}
])
}
// group customers with their spent,Customer Spending Distribution
export const getCSD = async(orgid)=>{
return Order.aggregate([{$match:{organization : toObjectId(orgid),status: "completed"}},
    {$group:{_id: "$customer",totalSpent: { $sum: "$totalPrice" }}},
    {$bucket: {groupBy: "$totalSpent",boundaries: [0, 100, 500, 1000, 5000],
    default: "5000+",output: { count: { $sum: 1 }}}}
])
}

// revenu per customer ,customer Lifetime Value (CLV)
export const getCLV = async(orgid)=>{
return Order.aggregate([{$match:{organization : toObjectId(orgid),status: "completed"}},
    {$group:{_id: "$customer",totalSpent: { $sum: "$totalPrice" }}}])
}
