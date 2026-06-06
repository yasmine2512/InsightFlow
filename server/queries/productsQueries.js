import mongoose from "mongoose";
import Product from "../Models/Product.js";
import Order from "../Models/Order.js";

const toObjectId = (id) =>
  new mongoose.Types.ObjectId(id);

//get all products
export const getallproducts = async(orgid)=>{
return products =await Product.find({organization: orgid});
}

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

//1 product
export const getproductdetails = async(orgid,prodid)=>{
return Product.findOne({_id:prodid,organization:orgid});
}

//revenu of a product,unit sold
export const getproductrevenu = async(orgid,prodid)=>{
return Order.aggregate([{$match:{organization:toObjectId(orgid),status:{$ne:"canceled"}}},{$unwind:"$products"},
    {$match:{"products.product" : toObjectId(prodid)}},
    {$group:{_id: "$products.product", revenue: {$sum: {$multiply: [
          "$products.quantity", "$products.priceAtPurchase"]  }},totalSold:{$sum:"$products.quantity"}}},
      {$project:{_id: 0,revenue: 1,totalSold:1}}
])
}



//green → >20 enough stock
//yellow → 10-20low stock
//red →  <10out of stock