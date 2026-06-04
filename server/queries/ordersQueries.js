import mongoose from "mongoose";
import Order from "../models/Order.js";

const toObjectId = (id) =>
  new mongoose.Types.ObjectId(id);

//all orders
export const getallOrders = async(orgId) =>{
    return Order.find({organization : orgId});
};

//total orders
export const gettotalOrders = async(orgId)=>{
    return Order.countDocuments({organization : orgId});
};
//pending orders
export const getpendingOrders = async(orgId)=>{
    return Order.countDocuments({organization : orgId,status : "pending"});
}
//completed orders
export const getcompletedOrders = async(orgId)=>{
    return Order.countDocuments({organization : orgId,status : "completed"});
}
// canceled orders 
export const getcanceledOrders = async(orgId)=>{
    return Order.countDocuments({organization : orgId,status : "canceled"});
}
//orders per day (7 days)
export const getordersperday = async(orgId)=>{
    const last7days = new Date();
    last7days.setDate(last7days.getDate() - 7);
    return Order.aggregate([{$match:{organization: toObjectId(orgId),createdAt:{$gte : last7days} }},{$group:{_id : {$dayOfMonth :"$createdAt"},orders : {$sum: 1}}},{$project:{_id:0,day:"$_id",orders:1}},{$sort:{day: 1}}]);
}
