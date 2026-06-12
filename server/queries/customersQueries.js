import mongoose from "mongoose";
import Order from "../Models/Order.js";
import Customer from "../Models/Customer.js";

const toObjectId = (id) =>
  new mongoose.Types.ObjectId(id);


//number of customers
export const gettotalcustomers= async (orgId) => {
  return Customer.countDocuments({organization: toObjectId(orgId)})};

//get all customers
export const getallCustomers = async (orgId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const match = {organization: toObjectId(orgId)};
  if (query.search) {match.$or = [{name: {$regex: query.search,$options: "i"}},
      {email: {$regex: query.search,$options: "i"}}]; }
  const pipeline = [
    {$match: match},
    {$sort: {createdAt: -1}},
    {$facet: {
        customers: [{ $skip: skip },{ $limit: limit }],
        totalCount: [{ $count: "count" }]
      } }
  ];
  const result = await Customer.aggregate(pipeline);
  return {customers: result[0].customers,total: result[0].totalCount[0]?.count || 0};
};

//customers retention rate
export const getCRR = async(orgId)=>{
  const now = new Date();
  const startCurrent = new Date(now.getFullYear(),now.getMonth(),1);
  const endCurrent = now;
  const startPrevious = new Date(now.getFullYear(),now.getMonth() - 1,1);
  const endPrevious = new Date(now.getFullYear(),now.getMonth() - 1,now.getDate());
  return Order.aggregate([{$match:{organization: toObjectId(orgId),status: "completed"}},
    {$facet: {
    current:[{$match: {createdAt: {$gte: startCurrent,$lte: endCurrent}}},
    {$group: {_id: "$customer",orders: { $sum: 1 }}},
    {$group: {_id: null,totalCustomers: { $sum: 1 },
    returningCustomers: {$sum: {$cond: [{ $gte: ["$orders", 2] },1,0]} }}}],
    previous: [{$match: {createdAt: {$gte: startPrevious,$lte: endPrevious}}},
    {$group: {_id: "$customer",orders: { $sum: 1 }}},
    {$group: {_id: null,totalCustomers: { $sum: 1 },
    returningCustomers: {$sum: {$cond: [{ $gte: ["$orders", 2] },1,0]}}}}]}} ]);
}

//active Customers This Month
export const getActiveCustomers = async (orgId) => {
  const now = new Date();
  const startCurrent = new Date(now.getFullYear(),now.getMonth(),1);
  const endCurrent = now;
  const startPrevious = new Date(now.getFullYear(),now.getMonth() - 1,1);
  const endPrevious = new Date(now.getFullYear(),now.getMonth() - 1,now.getDate());
  const result = await Order.aggregate([
    {$match:{organization: toObjectId(orgId),status: { $ne: "canceled" }}},
    {$facet: {
    current: [{$match: {createdAt: {$gte: startCurrent,$lte: endCurrent}}},
    {$group: {_id: "$customer"}},{ $count: "value"}],
    previous: [{$match: {createdAt: {$gte: startPrevious,$lte: endPrevious}}},
    {$group: {_id: "$customer"}},{ $count: "value"}]}}
  ]);
  return result[0];};


//Average CLV
export const getAvgCLV = async (orgId) => {
  return Order.aggregate([{$match: {organization: toObjectId(orgId),status: "completed"}},
    {$group: {_id: "$customer",totalSpent: { $sum: "$totalPrice" }}},
    {$group: {_id: null,avgCLV: { $avg: "$totalSpent" }}}]);
};

//new customers last 7 months
export const getCLM = async(orgid)=>{
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