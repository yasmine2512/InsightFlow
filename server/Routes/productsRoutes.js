import express from "express";
import Product from "../Models/Product.js"
import asyncHandler from "express-async-handler";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} from '../Middlewares/JWTauth.js'
import { getUpload, cloudinary } from "../Middlewares/Multer.js";
import {getProductsWithStats,getActiveProductsGrowth,getProductKPIs,gettopproducts, getallproducts}
 from "../Queries/productsQueries.js"
const router = express.Router();



/** 
   * @desc get all product , top selling products with revenu chart
   * @route /api/products/:organizationId
   * @method GET
   * @access private
   */ 

router.get("/:id/stats",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
    const orgid = req.params.id;
    const [activeproducts,productKPI,topproducts] =await Promise.all([
    getActiveProductsGrowth(orgid),
    getProductKPIs(orgid),
    gettopproducts(orgid)
    ]);
    const ATM = activeproducts?.activeThisMonth || 0; 
    const ALM = activeproducts?.activeLastMonth || 0;
    const growth = ALM === 0? 0: ((ATM - ALM) / ALM) * 100;
    return res.status(200).json({activeproducts:ATM,growth:growth,productsKPI:productKPI});
}))


router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
    const orgid = req.params.id;
    const products = await getProductsWithStats(orgid,req.query);
    return res.status(200).json({productslist:products});
}))


/** 
   * @desc get all product , top selling products with revenu chart
   * @route /api/products/:organizationId
   * @method GET
   * @access private
   */ 

router.get("/:id/cataloge",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
    const orgid = req.params.id;
  const products = await getallproducts(orgid,req.query);
  res.status(200).json({products});
  }));

/** 
   * @desc get product ,its revenu ,unit sold, conversion rate,stock level 
   * @route /api/products/:id/detail/:productid
   * @method GET
   * @access public
   */ 
  router.get("/:id/detail/:productid",verifyTokenAndAuthorization, asyncHandler(async (req, res) => {
  const orgid= req.params.id;
  const productid = req.params.productid;  
  const product = await Product.findOne({_id:productid,organization:orgid});
  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.json({ product });
}));

/** 
   * @desc insert new product
   * @route /api/products/:id/new-product
   * @method POST
   * @access private
   */ 
router.post("/:id/new-product", verifyTokenAndAuthorization, (req, res, next) => {
  getUpload().single("image")(req, res, next); // ← initialized when request hits
}, asyncHandler(async (req, res) => {
 const orgid = req.params.id;
const {name,price,desc,category,stock} = req.body;
let features = []
    try {
      features = JSON.parse(req.body.features)
    } catch (err) {
      return res.status(400).json({ message: "Features must be JSON array" })
    }
if (!req.file) return res.status(400).json({ message: "Image is required" });
 if (!name || !desc ||  price === undefined ||stock === undefined ){
    return res.status(400).json({ message: "Missing required fields" });
  }
const newproduct = new Product({
    organization: orgid,
    name,
    price,
    category,
    description : desc,
    features,
    stock,
    image :req.file.path,
})

await newproduct.save();
return res.status(201).json({message: "Product added successfully"});

}))

/** 
   * @desc delete product
   * @route /api/products/:id/product/:productid
   * @method DELETE
   * @access private
   */ 
  router.delete("/:id/product/:productid",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
    const orgid = req.params.id;
    const product = await Product.findOne({_id: req.params.productid,organization: orgid});
  if (!product) return res.status(404).json({ message: "Product not found" });

  // URL looks like: https://res.cloudinary.com/yourcloud/image/upload/v123/products/abc123.jpg
  const urlParts = product.image.split("/");
  const publicId = `products/${urlParts[urlParts.length - 1].split(".")[0]}`;
  await cloudinary.uploader.destroy(publicId);

  await Product.deleteOne({ _id: req.params.productid ,organization:orgid});
  return res.status(200).json({ message: "Product deleted successfully" });
  }))

  /** 
   * @desc update product
   * @route /api/products/:id/product/:productid
   * @method PUT
   * @access private
   */ 
  router.put("/:id/product/:productid", verifyTokenAndAuthorization, (req, res, next) => {
  getUpload().single("image")(req, res, next);
}, asyncHandler(async (req, res) => {
  const productId = req.params.productid;
  const orgid = req.params.id;
  const product = await Product.findOne({_id: productId,organization: orgid});
  if (!product) return res.status(404).json({ message: "Product not found" });

  const { name, desc, price, stock, category, features } = req.body;
  const updateFields = {};

  if (name) updateFields.name = name;
  if (desc) updateFields.description = desc;
  if (category) updateFields.category = category;
  if (price !== undefined) updateFields.price = price;
  if (stock !== undefined) updateFields.stock = Number(stock);

  // parse features if sent
  if (features) {
    try {
      updateFields.features = JSON.parse(features);
    } catch {
      return res.status(400).json({ message: "Features must be a JSON array" });
    }
  }

  // if new image uploaded, delete old from cloudinary and use new URL
  if (req.file) {
    if (product.image) {
      const urlParts = product.image.split("/");
      const publicId = `products/${urlParts[urlParts.length - 1].split(".")[0]}`;
      await cloudinary.uploader.destroy(publicId);
    }
    updateFields.image = req.file.path;
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  const updated = await Product.findOneAndUpdate(
    {_id:productId,organization:orgid},
    { $set: updateFields },
    { new: true }
  );

  return res.status(200).json({ message: "Product updated successfully", product: updated });
}));



export default router; 