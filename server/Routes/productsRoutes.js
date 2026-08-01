import express from "express";
import mongoose from "mongoose";
import Product from "../Models/Product.js"
import Order from "../Models/Order.js";
import asyncHandler from "express-async-handler";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} from '../Middlewares/JWTauth.js'
import multer from "multer";
import { getUpload, cloudinary } from "../Middlewares/Multer.js";
import {getProductsWithStats,getActiveProductsGrowth,getProductKPIs,gettopproducts, 
  getallproducts,getproductdetails} from "../Queries/productsQueries.js"
import xlsx from "xlsx";
const upload = multer({
   storage: multer.memoryStorage(),
 });
const router = express.Router();

const toObjectId = (id) =>
  new mongoose.Types.ObjectId(id);

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
   * @desc get all product catalog
   * @route /api/products/:organizationId/catalog
   * @method GET
   * @access private
   */ 

router.get("/:id/cataloge",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
    const orgid = req.params.id;
  const result = await getallproducts(orgid,req.query);
  res.status(200).json({products: result[0].products,
  total: result[0].total[0]?.count || 0,});
  }));

  /** 
   * @desc get all product for selecting
   * @route /api/products/:organizationId/select
   * @method GET
   * @access private
   */ 
router.get("/:id/select",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
    const orgid = req.params.id;
  const products = await Product.find({ organization: orgid }).select("name price stock sku");
  res.status(200).json(products);
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
  const result = await getproductdetails(orgid,productid);

  return res.status(200).json({result});
}));

/** 
   * @desc insert new product
   * @route /api/products/:id/new-product
   * @method POST
   * @access private
   */ 
router.post("/:id/new-product", verifyTokenAndAuthorization, (req, res, next) => {
  getUpload().single("image")(req, res, next); 
}, asyncHandler(async (req, res) => {
 const orgid = req.params.id;
const {name,price,desc,category,stock,sku} = req.body;
let features = []
    try {
      const parsed = JSON.parse(req.body.features ?? "[]");
      if (!Array.isArray(parsed)) {
        return res.status(400).json({message: "Features must be an array",});
      }
      features = parsed
        .map(feature => String(feature).trim())
        .filter(Boolean);
    } catch (err) {
      return res.status(400).json({ message: "Invalid features format" })
    }

  if (!name ||  price === undefined ||stock === undefined ){
      return res.status(400).json({ message: "Missing required fields" });
    }
    
  const existingProduct = await Product.findOne({organization: orgid,sku: sku});
  if (existingProduct) {
    return res.status(409).json({
      message: "A product with this SKU already exists in your organization"
    });
  } 

  const newProductData = {
  organization: orgid,
  name,
  price,
  category,
  description: desc,
  features,
  stock,
  sku,
};
if (req.file) {
  newProductData.image = req.file.path;
}

const newProduct = new Product(newProductData);
await newProduct.save();
return res.status(201).json({message: "Product added successfully"});

}))

/** 
   * @desc delete product
   * @route /api/products/:id/product/:productid
   * @method DELETE
   * @access private
   */ 
  router.delete("/:id/product/:productid",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
    const orgid = toObjectId(req.params.id);
    const prodid = toObjectId(req.params.productid);
    const product = await Product.findOne({_id: prodid,organization: orgid});
  if (!product) return res.status(404).json({ message: "Product not found" });
    const usedInOrders = await Order.exists({organization: orgid,"products.product": prodid});
    if (usedInOrders) {return res.status(400).json({message:
          "Cannot delete product because it exists in orders",});
    }
  const urlParts = product.image.split("/");
  const publicId = `products/${urlParts[urlParts.length - 1].split(".")[0]}`;
  try{
  await cloudinary.uploader.destroy(publicId);
  await Product.deleteOne({ _id: req.params.productid ,organization:orgid});
  }catch(err){
    console.error("delete product error:", err.response?.data);
    console.error("Full error:", err);
    return res.status(400).json({message: "a probleme happened during deleting"});
  }
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
  const { name, desc, price, stock, category, features,sku } = req.body;
  const updateFields = {};
  if (name) updateFields.name = name;
  if (desc) updateFields.description = desc;
  if (category) updateFields.category = category;
  if (price !== undefined) updateFields.price = price;
  if (stock !== undefined) updateFields.stock = Number(stock);
  if (sku !== undefined) updateFields.sku = sku;
  if (features) {
    try {updateFields.features = JSON.parse(features);} catch {
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

/**
 * @desc import products from excel
 * @route /api/products/import/:id
 * @method POST
 * @access private
 */
router.post("/import/:id",verifyTokenAndAuthorization,upload.single("file"),
  asyncHandler(async (req, res) => {
    const orgId = new mongoose.Types.ObjectId(req.params.id);
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }
    const workbook = xlsx.read(req.file.buffer, {
      type: "buffer",
    });
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(
      workbook.Sheets[sheetName]
    );
    if (!rows.length) {
      return res.status(400).json({
        message: "Empty Excel file",
      });
    }
    const errors = [];
    const createdProducts = [];
    for (const row of rows) {
      const sku = cleanString(row["SKU"]);
      const name = cleanString(row["Product Name"]);
      const price = cleanNumber(row["Price"]);
      const stock = cleanNumber(row["Stock"]);
      const category = cleanString(row["Category"]);
      const description = cleanString(row["Description"]);
      const features = cleanString(row["Features"]);
      const image = cleanString(row["Image URL"]);
      try {
        if (!sku || !name || price === undefined || stock === undefined) {
          errors.push({
            sku: sku || "unknown",
            message: "Missing required fields (SKU, Name, Price, Stock)",
          });
          continue;
        }
        if (Number.isNaN(price) || price < 0) {
          errors.push({
            sku: sku || "unknown",
            message: "Invalid price"
          });
          continue;
        }
        if (!Number.isInteger(stock) || stock < 0) {
          errors.push({
            sku: sku || "unknown",
            message: "Invalid stock"
          });
          continue;
        }

        const existing = await Product.findOne({
          organization: orgId,
          sku,
        });
        if (existing) {
          errors.push({
            sku,
            message: "Product with this SKU already exists",
          });
          continue;
        }
        const productFeatures = features
          ? [...new Set(
              features
                .split(",")
                .map(f => f.trim())
                .filter(Boolean)
            )]
          : [];
        const productData = {
          organization: orgId,
          sku,
          name,
          price: Number(price),
          stock: Number(stock),
          category,
          description,
          features: productFeatures,
        };
        if (image) {
          productData.image = image;
        }  
        const product = await Product.create(productData);
        createdProducts.push(product);
      } catch (err) {
        errors.push({sku,message: err.message,});
      }
    }
    if (!createdProducts.length) {
      return res.status(400).json({
        message: "Import failed - no products created",
        errors,
      });
    }
    return res.status(201).json({
      message: "Products imported successfully",
      created: createdProducts.length,
      failed: errors.length,
      errors,
    });
  })
);

//helper functions
const cleanString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\u00A0/g, " ").trim();
};

const cleanNumber = (value) => {
  if (value === null || value === undefined || value === "") return NaN;
  return Number(
    String(value).replace(",", ".").trim()
  );
};

export default router;