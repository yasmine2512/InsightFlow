import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Customer from "../Models/Customer.js";

const toObjectId = (id) =>
  new mongoose.Types.ObjectId(id);

//revenu of all time 
export const getrevenueResult =async (orgId) => {
  return Order.aggregate([{$match:{organization : toObjectId(orgId),status: "completed"}},{$group: {_id: null,revenue: { $sum: "$totalPrice" } }}]);};

//revenu growth
export const getMGR =async(orgId) =>{
const now = new Date();
// current month
const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
const endCurrent = new Date(now);
// previous month same day range
const startPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endPrevious = new Date(  now.getFullYear(),  now.getMonth() - 1, now.getDate());
  return Order.aggregate([{$match:{organization : toObjectId(orgId),status: "completed"}},
    {$group: {_id: null,
    currentRevenue: {$sum:{$cond:[{$and: [
    {$gte:["$createdAt", startCurrent] },{ $lte: ["$createdAt", endCurrent] }]},"$totalPrice",0]
        }},
    previousRevenue: {$sum:{$cond: [{ $and: [
    {$gte: ["$createdAt", startPrevious] },{$lte:["$createdAt",endPrevious]}]},"$totalPrice",0]
        }}}
  }]);};

//orders this month + last month
export const getOrders =async(orgId) =>{
const now = new Date();
// current month
const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
const endCurrent = new Date(now);
// previous month same day range
const startPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endPrevious = new Date(  now.getFullYear(),  now.getMonth() - 1, now.getDate());
  return Order.aggregate([{$match:{organization : toObjectId(orgId),status: { $ne: "canceled" }}},
    {$group: {_id: null,
    currentOrders: {$sum:{$cond:[{$and: [
    {$gte:["$createdAt", startCurrent] },{ $lte: ["$createdAt", endCurrent] }]},1,0]
        }},
    previousOrders: {$sum:{$cond: [{ $and: [
    {$gte: ["$createdAt", startPrevious] },{$lte:["$createdAt",endPrevious]}]},1,0]
        }}}
  }]);};


  //customers this month + growth
export const getCustomers =async(orgId) =>{
const now = new Date();
// current month
const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
const endCurrent = new Date(now);
// previous month same day range
const startPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endPrevious = new Date(  now.getFullYear(),  now.getMonth() - 1, now.getDate());
  return Customer.aggregate([{$match:{organization : toObjectId(orgId)}},
    {$group: {_id: null,
    currentCustomers: {$sum:{$cond:[{$and: [
    {$gte:["$createdAt", startCurrent] },{ $lte: ["$createdAt", endCurrent] }]},1,0]
        }},
    previousCustomers: {$sum:{$cond: [{ $and: [
    {$gte: ["$createdAt", startPrevious] },{$lte:["$createdAt",endPrevious]}]},1,0]
        }}}
  }]);};



//revenu last 7 months
export const getrevenuel7m = async (orgId) => {    
  const sevenMonthsAgo = new Date();
  sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
  return Order.aggregate([
  {$match:{organization : toObjectId(orgId) ,createdAt: {$gte:sevenMonthsAgo},status: "completed"}},
  {$group:{
  _id: {year: { $year: "$createdAt" },
  month: { $month: "$createdAt" }},
  revenue: { $sum: "$totalPrice" }  }}, 
  {$project: {
      _id: 0,
      year: "$_id.year",
      month: "$_id.month",
      revenue: 1  }},
  {$sort: { year: 1, month: 1}}]);};

 // number of orders this week
export const getordersthisweek = async (orgId) => {
  const lastweek = new Date();
  lastweek.setDate(lastweek.getDate() - 7);
  return Order.aggregate([{$match:{organization : toObjectId(orgId), createdAt : {$gte: lastweek},status: {$ne:"canceled"}}},{$group:{_id :{$dayOfMonth :"$createdAt"},orders: { $sum: 1 } }},{$project:{_id:0,day:"$_id",orders:1}},{$sort:{day: 1}}]);};

//5 best seller products
export const getBSP =  async (orgId) => {
  return Order.aggregate([{$match:{organization : toObjectId(orgId),status: "completed"}},
  {$unwind:"$products"},
  {$group:{_id: "$products.product",totalSold: { $sum: "$products.quantity" }}},
  { $sort: { totalSold: -1 } },
  { $limit: 5 },
  {
  $lookup: {
    from: "products",
    localField: "_id",
    foreignField: "_id",
    as: "product"
  }},
  {$unwind:"$product"}
]);};


//stock alert
export const getstockalert = async (orgId) =>{
  return Product.aggregate([
    {$match: {organization: toObjectId(orgId)}},
    {$group: { _id: null,lowStock: {$sum: { $cond: [{ $lte: ["$stock", 10] }, 1, 0]}},
        outOfStock: { $sum: {$cond: [{ $eq: ["$stock", 0] }, 1, 0]}}}}
  ]);
};

//top 5 customers
export const getTC = async (orgId) =>{
  return Order.aggregate([{$match:{organization : toObjectId(orgId),status: "completed"}},{$group:{_id: "$customer",numorders: {$sum: 1},totalSpent: { $sum: "$totalPrice" }}},
  {$sort :{numOrders:-1}},{$limit : 5},
  {$lookup: {
      from: "customers",         
      localField: "_id",          
      foreignField: "_id",        
      as: "customer"}},
  { $unwind: "$customer"},
  {$project: {
      _id: 0,
      customerId: "$customer._id",
      name: "$customer.name",
      email: "$customer.email",
      numOrders: 1,
      totalSpent: 1}}]);};

//recent orders
export const getrecentorders = async (orgId) =>{
  return Order.find({organization : toObjectId(orgId)}).sort({ createdAt: -1 }).limit(5);};