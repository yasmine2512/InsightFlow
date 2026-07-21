import express from "express";
const router = express.Router();
import User from '../Models/User.js'
import Product from "../Models/Product.js"
import Customer from "../Models/Customer.js";
import Subscription from "../Models/Subscription.js";
import Order from "../Models/Order.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} from '../Middlewares/JWTauth.js'
import passport from "passport";
import mongoose from "mongoose";


router.get("/google",passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);
router.get("/google/callback",
  passport.authenticate("google", {session: false,failureRedirect: "/login"}),
  async (req, res) => {
    const { user, token } = req.user;
    res.redirect(`http://localhost:5173/oauth-success?token=${token}&id=${user._id}`);
  }
);

/** 
   * @desc login
   * @route /api/auth/login
   * @method POST
   * @access public
   */  
  router.post("/login",asyncHandler(async(req,res)=>{
const user = await User.findOne({ email: req.body.email });
if (!user) return res.status(404).json({message :"User not found"});

const validPassword = await bcrypt.compare(
  req.body.password,
  user.password
);
if (!validPassword) return res.status(401).json({message :"Wrong password"});
// create token
const token = jwt.sign(
  { id: user._id, isadmin: user.isadmin },
  process.env.JWT_SECRET_KEY,
  { expiresIn: "1d" }
);
const { password, ...other } = user._doc;
res.status(200).json({ user :other, token });
  }))
  
/** 
   * @desc register
   * @route /api/auth/register
   * @method POST
   * @access public
   */  

  router.post("/register", asyncHandler(async (req, res) => {
  console.log(req.body); 

  const { name,email, password} = req.body;

  if (!name ||!email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "User already exists" });
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser =await User.create({
    name,
    email,
    password: hashedPassword,
  });
// create token
const token = jwt.sign(
  { id: newUser._id, isadmin: newUser.isadmin },
  process.env.JWT_SECRET_KEY,
  { expiresIn: "1d" }
);
const { password: _, ...other } = newUser._doc;
res.status(200).json({ user:other, token });
}));

/** 
   * @desc get users list
   * @route /api/auth/:id/all-users
   * @method GET
   * @access private
   */  
router.get("/:id/all-users",verifyTokenAndAdmin,asyncHandler(async(req,res)=>{
const all_users = await User.find(); //pagination
const count = await User.countDocuments()
res.json({users : all_users });
}))

/** 
   * @desc delete user
   * @route /api/auth/:id
   * @method DELETE
   * @access private
   */  
router.delete("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
    const userId = req.params.id;
    await Promise.all([
     Customer.deleteMany({ organization: userId }),
     Product.deleteMany({ organization: userId }),
     Order.deleteMany({ organization: userId }),
     Subscription.deleteMany({ organization: userId })
    ]);
    await User.findByIdAndDelete(userId);
    return res.status(200).json({message : "user deleted succesfully"});

}))

  /** 
   * @desc get profile
   * @route /api/auth/profile/:id
   * @method GET
   * @access private
   */  
  router.get("/profile/:id",verifyTokenAndAuthorization,asyncHandler(async (req, res) => {
 const orgId = new mongoose.Types.ObjectId(req.params.id);
 const user = await User.findById(orgId).select("-password");
 return res.status(200).json(user);
}));

/** 
   * @desc update profile
   * @route /api/auth/profile/:id
   * @method PUT
   * @access private
   */  
 router.put("/profile/:id",verifyTokenAndAuthorization,asyncHandler(async (req, res) => {
 const orgId = req.params.id;
 const {name,orgname} = req.body;
 const user = await User.findByIdAndUpdate(req.params.id,{
        $set: {
          ...(name && { name }),
          ...(orgname && { organizationName: orgname }),
        },},{ new: true }  ).select("-password");
 return res.status(200).json(user);
}));

export default router; 

