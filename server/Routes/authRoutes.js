import express from "express";
const router = express.Router();
import User from '../Models/User.js'
import Product from "../Models/Product.js"
import Customer from "../Models/Customer.js";
import Subscription from "../Models/Subscription.js";
import Order from "../Models/Order.js";
import Counter from "../Models/Counter.js";
import File from "../Models/File.js";
import Conversation from "../Models/Conversation.js";
import Message from "../Models/Message.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} from '../Middlewares/JWTauth.js'
import sendEmail from "../Middlewares/sendEmail.js";
import passport from "passport";
import mongoose from "mongoose";
import { cloudinary } from "../Middlewares/Multer.js";
const isProduction = process.env.NODE_ENV === "production";

router.get("/google",passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);
router.get("/google/callback",
  passport.authenticate("google", {session: false,failureRedirect: "/login"}),
  async (req, res) => {
    const { user, token } = req.user;
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,              
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.redirect(`${process.env.CLIENT_URL}/oauth-success`);
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
res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,              
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
  });

  const sanitizedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isadmin: user.isadmin,
      plan: user.plan,
      organizationName: user.organizationName,
    };
res.status(200).json({ user :sanitizedUser});
  }))
  
/** 
   * @desc register
   * @route /api/auth/register
   * @method POST
   * @access public
   */  

  router.post("/register", asyncHandler(async (req, res) => {
  const { name,email, password} = req.body;

  if (!name ||!email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const validDomain = await emailDomainExists(email);
if (!validDomain) {
  return res.status(400).json({
    message:"Email domain does not exist. Please enter valid email"
  });
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

  await Counter.create({
  organization: newUser._id,
  type: "order",
  seq: 999,
});

// create verify token
const verificationToken = jwt.sign(
  {id: newUser._id,type: "verify"},process.env.JWT_SECRET_KEY,{expiresIn: "3h"});
const verifyUrl =`${process.env.SERVER_URL}/api/auth/verify-email/${verificationToken}`;
// send verification email
  try {
      await sendEmail({
        to: newUser.email,
        subject: "Verify your email",
        html: `
            <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 32px; width: 100%; max-width: 480px;">
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="width: 48px; height: 48px; background-color: rgba(15, 23, 42, 0.05); border-radius: 50%;">
                      <span style="font-size: 20px; color: #0f172a;">✉️</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 8px;">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #0f172a;">Welcome, ${newUser.name}!</h2>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                  Thanks for getting started! Please verify your email address by clicking the button below.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="border-radius: 12px; background-color: #0f172a;">
                      <a href="${verifyUrl}" target="_blank" style="font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; border: 1px solid #0f172a; display: inline-block;">Verify Email</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center">
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
                  If you didn't create an account, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
        `});
  } catch(error) {
    console.error("Email sending failed:", error);
    await User.findByIdAndDelete(newUser._id);
    await Counter.findByIdAndDelete(newUser._id);
    throw new Error("Failed to send verification email");
  }
res.status(201).json({message: "Registration successful. Please verify your email."});
}));

/** 
 * @desc Logout user / Clear cookie
 * @route POST /api/auth/logout
 * @method POST
 * @access public
 */ 
router.post("/logout", (req, res) => {
  // Clear the HttpOnly cookie by setting its expiry to the past
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,              
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
});


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
        return res.redirect(`${process.env.CLIENT_URL}/login?verified=already`);

    user.isVerified = true;

    await user.save();

    // create token
const token = jwt.sign(
  { id: user._id, isadmin: user.isadmin },
  process.env.JWT_SECRET_KEY,
  { expiresIn: "1d" }
);
res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,              
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000
    });
 res.redirect(`${process.env.CLIENT_URL}/verify-success`);


}));

/** 
   * @desc get users list
   * @route /api/auth/:id/all-users
   * @method GET
   * @access private
   */  
router.get("/:id/all-users",verifyTokenAndAdmin,asyncHandler(async(req,res)=>{
const all_users = await User.find(); 
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
    const conversations = await Conversation.find(
      { organization: userId },
      { _id: 1, threadId: 1 }
    );
    const conversationIds = conversations.map(c => c._id);
    const threadIds = conversations
      .map(c => c.threadId)
      .filter(Boolean);
    const files = await File.find(
      { organization: userId },
      { publicId: 1 }
    );

     await Promise.all(
      files.map(file =>
        cloudinary.uploader.destroy(file.publicId, {
          resource_type: "raw",
        })
      )
    );

    for (const threadId of threadIds) {
      await fetch(
        `${process.env.AGENT_API_URL}/api/agent/thread`,
        {
          method: "DELETE",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({thread_id: threadId}),
        }
      );
    }
    await Promise.all([
     Customer.deleteMany({ organization: userId }),
     Product.deleteMany({ organization: userId }),
     Order.deleteMany({ organization: userId }),
     Counter.deleteOne({organization: userId}),
     Subscription.deleteMany({ organization: userId }),
     File.deleteMany({ organization: userId }),
     Message.deleteMany({conversation: { $in: conversationIds }}),
     Conversation.deleteMany({organization: userId,}),
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
        },},{ returnDocument: "after" }  ).select("-password");
 return res.status(200).json(user);
}));

/** 
   * @desc generate update password url
   * @route /api/auth/forgot-password
   * @method PUT
   * @access private
   */  
router.post("/forgot-password", asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({message:"User not found , Please enter a valid email"});
    }
    const secret = process.env.JWT_SECRET_KEY + user.password;
    const token = jwt.sign(
        {id: user._id,type: "reset"},secret,{expiresIn: "15m"}
    );

    const resetUrl =`${process.env.CLIENT_URL}/reset-password/${user._id}/${token}`;
try {
       await sendEmail({
        to: user.email,
        subject: "Reset Password",
        html: `
            <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 32px; width: 100%; max-width: 480px;">
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="width: 48px; height: 48px; background-color: rgba(15, 23, 42, 0.05); border-radius: 50%;">
                      <span style="font-size: 20px; color: #0f172a;">🔑</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 8px;">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #0f172a;">Password Reset</h2>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                  We received a request to reset your password. Click the button below to choose a new one.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="border-radius: 12px; background-color: #0f172a;">
                      <a href="${resetUrl}" target="_blank" style="font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; border: 1px solid #0f172a; display: inline-block;">Reset Password</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 16px;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #0f172a; word-break: break-all;">
                  ${resetUrl}
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="border-top: 1px solid #f1f5f9; padding-top: 16px;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
                  If you didn't request a password reset, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  
        `
    });
  } catch(error) {
    console.error("Email sending failed:", error.message);
    throw new Error("Failed to send reseting email");
  }
    res.json({message:"Check your inbox ,a reset email has been sent."});

}));

/** 
   * @desc reset password
   * @route /api/auth/reset-password/:userId/:token
   * @method PUT
   * @access private
   */ 
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

async function emailDomainExists(email) {
  const domain = email.split("@")[1];
  try {
    const response = await axios.get(
      "https://dns.google/resolve",
      {
        params: {
          name: domain,
          type: "MX"
        }
      }
    );
    return (
      response.data.Answer &&
      response.data.Answer.length > 0
    );
  } catch(error) {
    console.error(error.message);
    return false;
  }
}

export default router; 

