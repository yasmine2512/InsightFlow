import mongoose from "mongoose";
import Order from "../Models/Order.js";

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
        {$sort: {createdAt: -1,_id: -1}},
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


export const getPendingOrdersCount = async (orgId) => {
return Order.countDocuments({organization:orgId,status:"pending"});
};

//orders per day (7 days),per month 
export const getOrdersChart = async (orgId, period = "7days") => {
  const now = new Date();
  let startDate;
  let groupId;
  if (period === "7months") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    groupId = {
      $dateToString: {
        format: "%Y-%m",
        date: "$createdAt",
      }
    };
  } else {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 6);
    groupId = {
      $dateToString: {
        format: "%Y-%m-%d",
        date: "$createdAt",
      }
    };
  }
  return Order.aggregate([
    {$match: {
        organization: toObjectId(orgId),
        createdAt: { $gte: startDate },
        status: { $ne: "canceled" },
      },
    },
    {$group: {
        _id: groupId,
        orders: { $sum: 1 },
      },
    },
    {$project: {
        _id: 1,
        day: "$_id",
        orders: 1,
      },
    },
    {$sort: {
        day: 1,
      },
    },
  ]);
};
