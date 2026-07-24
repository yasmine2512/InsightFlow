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
import sendEmail from "../Middlewares/sendEmail.js";
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
if (!user.isVerified) {
    return res.status(403).json({message: "Please verify your email."});
}
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
    isVerified: false
  });
// create verify token
const verificationToken = jwt.sign(
  {id: newUser._id,type: "verify"},process.env.JWT_SECRET_KEY,{expiresIn: "3h"});
const verifyUrl =`${process.env.SERVER_URL}/api/auth/verify-email/${verificationToken}`;
// send verification email
await sendEmail({
        to: newUser.email,
        subject: "Verify your email",
        html: `
            <h2>Welcome ${newUser.name}</h2>
            <p>Please verify your email.</p>
            <a href="${verifyUrl}">Verify Email</a>
        `});
res.status(201).json({message: "Registration successful. Please verify your email."});
}));


/** 
   * @desc verify email
   * @route /api/auth/verify-email/:token
   * @method GET
   * @access private
   */  
router.get("/verify-email/:token", asyncHandler(async (req, res) => {
    let payload;
    try{
    payload = jwt.verify(req.params.token,process.env.JWT_SECRET_KEY);
    } catch (err) {
    return res.status(400).json({message: "Invalid or expired link."});
    }
    if (payload.type !== "verify")
        return res.status(400).json({message: "Invalid token."});

    const user = await User.findById(payload.id);
    if (!user)
        return res.status(404).json({message: "User not found."});

    if (user.isVerified)
        return res.json({message: "Email already verified."});

    user.isVerified = true;

    await user.save();

    // create token
const token = jwt.sign(
  { id: user._id, isadmin: user.isadmin },
  process.env.JWT_SECRET_KEY,
  { expiresIn: "1d" }
);
 res.redirect(`${process.env.CLIENT_URL}/verify-success?token=${token}`);


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
 * @desc get current logged user
 * @route /api/auth/me
 * @method GET
 * @access private
 */
router.get("/me",verifyToken,asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }
    res.status(200).json({user});
  })
);

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

/** 
   * @desc generate update password url
   * @route /forgot-password
   * @method PUT
   * @access private
   */  
router.post("/forgot-password", asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({message:"User not found , Please enter a valid email"});
    }
    const secret = process.env.JWT_SECRET_KEY + user.password;
    const token = jwt.sign(
        {id: user._id,type: "reset"},secret,{expiresIn: "15m"}
    );

    const resetUrl =`${process.env.CLIENT_URL}/reset-password/${user._id}/${token}`;

    await sendEmail({
        to: user.email,
        subject: "Reset Password",
        html: `
            <h2>Password Reset</h2>
            <p>Click below to reset your password.</p>
            <a href="${resetUrl}">Reset Password</a>
        `
    });
    res.json({message:"Check your inbox ,a reset email has been sent."});

}));

router.post("/reset-password/:userId/:token", asyncHandler(async (req, res) => {
    const { password } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const secret = process.env.JWT_SECRET_KEY + user.password;
    let payload;
    try {
    payload = jwt.verify(req.params.token,secret);
    } catch (err) {
    return res.status(400).json({message: "Invalid or expired link."});
}
    if (payload.type !== "reset")
        return res.status(400).json({message: "Invalid token."});

    user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.json({message: "Password updated successfully."});

}));

export default router; 

