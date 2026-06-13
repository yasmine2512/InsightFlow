import mongoose from "mongoose";
import Product from "../Models/Product.js";
import Order from "../Models/Order.js";

const toObjectId = (id) =>
  new mongoose.Types.ObjectId(id);

//get all products
export const getallproducts = async(orgId,query)=>{
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const match = {organization: toObjectId(orgId)};
  if (query.search) {
    match.$or = [
      {name: {
          $regex: query.search,
          $options: "i"
        }},
      {category: {
          $regex: `^${query.search}`,
          $options: "i"
        }}
    ];
}
return Product.aggregate([{$match:match},
  {$facet: {
      products: [
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ],
      total: [{$count: "count"}]
    }}
]);
}

//getproducttable
export const getProductsWithStats = async (orgId, query) => {
  const now = new Date();
  const startMonth = new Date(now.getFullYear(),now.getMonth(),1);
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const match = {organization: toObjectId(orgId)};
  if (query.category) {match.category = query.category;}
  if (query.filter === "Low Stock") {match.stock = { $lte: 10 };}
  if (query.search) {
    match.$or = [
      {name: {
          $regex: query.search,
          $options: "i"
        }},
      {category: {
          $regex: `^${query.search}`,
          $options: "i"
        }}
    ];
}
const pipeline =[
{$match: match},
    {$lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "products.product",
        as: "orders"
      }},
    {$unwind: {
        path: "$orders",
        preserveNullAndEmptyArrays: true
      }},
    {$unwind: {
        path: "$orders.products",
        preserveNullAndEmptyArrays: true
      }},
    {$match: {
        $expr: {
          $or: [
            {$eq: [
                "$orders.products.product",
                "$_id"
              ]},
            {$eq: [
                "$orders",
                null
              ]}]}
    }},
    {$group: {_id: "$_id",
        name: {$first: "$name"},
        price: {$first: "$price"},
        stock: {$first: "$stock"},
        category: {$first: "$category"},
        sold: {$sum: {$cond: [{ $eq: ["$orders.status", "completed"] },
        { $ifNull: ["$orders.products.quantity", 0] }, 0]}},
        revenue: {$sum: {$cond: [{ $eq: ["$orders.status", "completed"] },
        {$multiply: [
          { $ifNull: ["$orders.products.quantity", 0] },
          { $ifNull: ["$orders.products.priceAtPurchase", 0] }]},0]}},
        soldThisMonth: {$sum: {
            $cond: [ {$and: [
          { $gte: ["$orders.createdAt", startMonth] },
          { $eq: ["$orders.status", "completed"] }]},
          { $ifNull: ["$orders.products.quantity", 0] },0]
          }}
      }},
    {$addFields: {isActive: {$gt: ["$soldThisMonth",0]}}},
    {$match: query.filter === "active" ? { isActive: true } : {}},
    {$facet: {
    products: [{$sort: (() => {
          switch (query.sort) {
            case "price_asc":return { price: 1 };
            case "price_desc":return { price: -1 };
            case "sold_desc":return { sold: -1 };
            case "revenue_desc":
            default:return { revenue: -1 };
          }})()
      },
      {$skip: skip},
      {$limit: limit}],
    totalCount: [{$count: "count"}]
  }
}];
const result = await Product.aggregate(pipeline);
return { products: result[0].products, total: result[0].totalCount[0]?.count || 0};
};

//1 product
export const getproductdetails = async(orgid,prodid)=>{
const now = new Date();
const startOfThisMonth = new Date(now.getFullYear(),now.getMonth(),1);
const startOfLastMonth = new Date( now.getFullYear(), now.getMonth() - 1,1);
const endOfLastMonth = new Date(now.getFullYear(),now.getMonth(),0);
const stats = await Order.aggregate([
  {$match: {organization:toObjectId(orgid),status: "completed"}},
  {$unwind: "$products"},
  {$match: {"products.product": toObjectId(prodid)}},
  {$group: {_id: null,
      revenueThisMonth: {$sum: {$cond: [{$gte: ["$createdAt",startOfThisMonth]},
            {$multiply: ["$products.quantity","$products.priceAtPurchase"]},  0]}},
      revenueLastMonth: {$sum: {$cond: [{$and: [
                {$gte: ["$createdAt",startOfLastMonth]},
                {$lte: ["$createdAt",endOfLastMonth]}  ]},
            {$multiply: ["$products.quantity","$products.priceAtPurchase"]},0]} },
      unitsSold: {$sum: "$products.quantity"}
    }}
]);
const product = await Product.findById(prodid);
if (!product) return res.status(404).json({ message: "Product not found" });
const result = stats[0] || {revenueThisMonth: 0,revenueLastMonth: 0,unitsSold: 0};
const growth =result.revenueLastMonth === 0? 100: (
((result.revenueThisMonth -result.revenueLastMonth) /result.revenueLastMonth) * 100).toFixed(1);
const finalData = {
  product,
  analytics: {
    revenueThisMonth: result.revenueThisMonth,
    revenueLastMonth: result.revenueLastMonth,
    growthPercentage: growth,
    unitsSold: result.unitsSold,
  }
};
return finalData;
}


//active products number
export const getActiveProductsGrowth = async (orgId) => {
  const now = new Date();
  const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
  const startPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endPrevious = new Date(now.getFullYear(), now.getMonth(), 0);
  const result = await Order.aggregate([
    {$match: {organization: toObjectId(orgId),status: "completed"} },
    {$unwind: "$products"},{$group: {
        _id: "$products.product",
        current: {$sum: {$cond: [{ $gte: ["$createdAt", startCurrent] },1,0 ]}},
        previous: { $sum: {$cond: [{$and: [{ $gte: ["$createdAt", startPrevious] },
                  { $lte: ["$createdAt", endPrevious] }]},1,0]}}
      }},
    {$project:{isActiveCurrent:{ $gt:["$current",0] },isActivePrevious:{ $gt: ["$previous", 0]}}},
    {$group: {
        _id: null,
        activeThisMonth: { $sum: { $cond: ["$isActiveCurrent", 1, 0] }},
        activeLastMonth: {$sum: { $cond: ["$isActivePrevious", 1, 0] }}
      }}]);
  return result[0] || {activeThisMonth: 0,activeLastMonth: 0 };
};

//inventory value,low stock , out of stock
export const getProductKPIs = async (orgId) => {
  return Product.aggregate([
    {$match: {organization: toObjectId(orgId)}},
    {$facet: 
     {totalProducts: [{ $count: "count"}],
      lowStock: [{$match: { stock: { $lte: 10 , $gt: 0}}},{ $count: "count"}],
      outOfStock: [{$match: { stock: 0}},{$count: "count" } ],
      inventoryValue: [{ $project: {value: {$multiply: ["$stock", "$price"]} }},
    {$group: {_id: null,total: { $sum: "$value" }}}
  ]}},
    { $project: {_id: 0,
        totalProducts: {$ifNull: [{ $arrayElemAt: ["$totalProducts.count", 0] },0]},
        lowStock: {$ifNull: [{ $arrayElemAt: ["$lowStock.count", 0] },0]},
        outOfStock: {$ifNull: [{ $arrayElemAt: ["$outOfStock.count", 0] },0]},
        inventoryValue: {$ifNull: [{ $arrayElemAt: ["$inventoryValue.total", 0] },0]}}}
  ]);
};


//top 5 products with it revenu (id,name ,revenu)
export const gettopproducts = async(orgid)=>{
return Order.aggregate([{$match:{organization : toObjectId(orgid),status:"completed"}},{$unwind:"$products"},
  {$group:{_id: "$products.product",totalSold: { $sum: "$products.quantity" },
  revenue: {$sum: {$multiply: [ "$products.quantity", "$products.priceAtPurchase"]  }}}},
  { $sort: { totalSold: -1 } },
  { $limit: 5 },
      { $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product" }},
      { $unwind: "$product"},
{$project:{_id: 0,totalSold: 1, productId: "$product._id",name: "$product.name",revenue: 1}}]);
};

//green → >20 enough stock
//yellow → 10-20low stock
//red →  <10out of stock
