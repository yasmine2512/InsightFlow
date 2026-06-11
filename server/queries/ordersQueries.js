import mongoose from "mongoose";
import Order from "../models/Order.js";

const toObjectId = (id) =>
  new mongoose.Types.ObjectId(id);

//all orders
export const getallOrders = async (orgId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const match = {organization: toObjectId(orgId)};
  const orderNumber = Number(query.search);
  if (query.status) { match.status = query.status;}
  const pipeline = [{$match: match},{
      $lookup: {
        from: "customers",
        localField: "customer",
        foreignField: "_id",
        as: "customer"}},
    { $unwind: {
        path: "$customer",
        preserveNullAndEmptyArrays: true}},
       {
      $addFields: {
        orderNumberString: {
          $toString: "$orderNumber"
        }
      }
    }];

  if (query.search) {
    pipeline.push({
      $match: {
        $or: [{
            "customer.name": {
              $regex: query.search,
              $options: "i"}},
               {
            orderNumberString: {
              $regex: `^${query.search}`,
              $options: "i"
            } }]
      }});}
  pipeline.push({
    $facet: {
      orders: [
        {$sort: {createdAt: -1}},
        {$skip: skip},
        {$limit: limit},
        {$lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "productDetails"
          }},
        {$addFields: {
            products: {
              $map: {
                input: "$products",
                as: "p",
                in: {quantity: "$$p.quantity",
                  priceAtPurchase: "$$p.priceAtPurchase",
                  product: {
                    $arrayElemAt: [
                      {$filter: {
                          input: "$productDetails",
                          as: "pd",
                          cond: { $eq: ["$$pd._id","$$p.product"]}
                        }}, 0]}
                }}}}},
        {$project: {
            orderNumber: 1,
            totalPrice: 1,
            status: 1,
            createdAt: 1,
            customerName: "$customer.name",
            products: {
              $map: {
                input: "$products",
                as: "p",
                in: {
                  name: "$$p.product.name",
                  quantity: "$$p.quantity",
                  priceAtPurchase: "$$p.priceAtPurchase"}
              }}}}
      ],
      totalCount: [{$count: "count"}]}
  });
  const result = await Order.aggregate(pipeline);
  return {orders: result[0].orders,total: result[0].totalCount[0]?.count || 0};
};
//total orders
export const gettotalOrders = async(orgId)=>{
    return Order.countDocuments({organization : orgId});
};
//completed orders 
export const getCompletedOrders =async(orgId) =>{
const now = new Date();
const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
const endCurrent = new Date(now);
const startPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endPrevious = new Date(  now.getFullYear(),  now.getMonth() - 1, now.getDate());
  return Order.aggregate([{$match:{organization : toObjectId(orgId),status:"completed"}},
    {$group: {_id: null,
    currentCOrders: {$sum:{$cond:[{$and: [
    {$gte:["$createdAt", startCurrent] },{ $lte: ["$createdAt", endCurrent] }]},1,0]
        }},
    previousCOrders: {$sum:{$cond: [{ $and: [
    {$gte: ["$createdAt", startPrevious] },{$lte:["$createdAt",endPrevious]}]},1,0]
        }}}
  }]);};

//orders by status
export const getOrdersByStatus = async (orgId) => {
  const now = new Date();
  const startMonth = new Date( now.getFullYear(), now.getMonth(),1);
return Order.aggregate([{$match:{organization:toObjectId(orgId),createdAt: { $gte: startMonth }}},
 { $group: {_id: "$status",count: { $sum: 1 }}}]);};

//orders per day (7 days)
export const getordersperday = async(orgId)=>{
    const last7days = new Date();
    last7days.setDate(last7days.getDate() - 6);
    return Order.aggregate([{$match:{organization: toObjectId(orgId),createdAt:{$gte : last7days},status: {$ne:"canceled"} }},{$group:{_id : {$dateToString: {format: "%Y-%m-%d",date: "$createdAt"}},
    orders : {$sum: 1}}},{$project:{_id:0,day:"$_id",orders:1}},{$sort:{day: 1}}]);
}
