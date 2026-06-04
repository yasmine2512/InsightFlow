import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const toObjectId = (id) =>
  new mongoose.Types.ObjectId(id);

//revenu
export const getrevenueResult =async (orgId) => {
  return Order.aggregate([{$match:{organization : toObjectId(orgId),status: "completed"}},{$group: {_id: null,revenue: { $sum: "$totalPrice" } }}]);};

//number of orders and products
export const getnorders = async (orgId) => {
  return Order.countDocuments({ organization: orgid });};
export const getnproducts =async (orgId) => {
  return Product.countDocuments({ organization: orgid });};
//number of customers
export const getcustomerResult= async (orgId) => {
  return Order.aggregate([{$match:{organization : toObjectId(orgId)}},{$group:{_id : "$customer" }},{  $count: "customer"}]);};

//revenu last 7 months
export const getrevenuel7m = async (orgId) => {    
  const sevenMonthsAgo = new Date();
  sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
  return Order.aggregate([
  {$match:{organization : toObjectId(orgId) ,createdAt: {$gte:sevenMonthsAgo}}},
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
  return Order.aggregate([{$match:{organization : toObjectId(orgId), createdAt : {$gte: lastweek}}},{$group:{_id :{$dayOfMonth :"$createdAt"},orders: { $sum: 1 } }},{$project:{_id:0,day:"$_id",orders:1}},{$sort:{day: 1}}]);};

//5 best seller products
export const getBSP =  async (orgId) => {
  return Order.aggregate([{$match:{organization : toObjectId(orgId)}},{
  $lookup: {
    from: "products",
    localField: "_id",
    foreignField: "_id",
    as: "product"
  }
},{$unwind:"$products"},{$group:{_id: "$products.product",totalSold: { $sum: "$products.quantity" }}},
  { $sort: { totalSold: -1 } },
  { $limit: 5 }]);};

//stock alert
export const getstockalert = async (orgId) =>{
  return Product.find({organization : orgid ,stock:{$lte:10}});};

//top 5 customers
export const getTC = async (orgId) =>{
  return Order.aggregate([{$match:{organization : toObjectId(orgId)}},{$group:{_id: "$customer",numorders: {$sum: 1},totalSpent: { $sum: "$totalPrice" }}},
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
      totalSpent: 1}},{$sort :{numorders:-1}},{$limit : 5}]);};

//recent orders
export const getrecentorders = async (orgId) =>{
  return Order.find({organization : orgid}).sort({ createdAt: -1 }).limit(5);};