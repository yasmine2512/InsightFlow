import express from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Conversation from "../Models/Conversation.js";
import Message from "../Models/Message.js";
import User from "../Models/User.js";
import { verifyTokenAndAuthorization} from '../Middlewares/JWTauth.js'
import { chatMessageLimiter } from "../Middlewares/chatLimiter.js";
import { deleteAIThread , chatWithAI } from "../Services/aiService.js";
const router = express.Router();

router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
  try {
    const orgId = req.params.id;

    const chats = await Conversation.find({organization: orgId,})
      .sort({ updatedAt: -1 })
      .select("_id title threadId createdAt updatedAt");

    res.json(chats);
  } catch (error) {
    console.error("Failed to load chats:", error);
    res.status(500).json({
      message: "Failed to load chats",
    });
  }
})
);

router.post("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
  try {
    const orgId = req.params.id;
    
        const user = await User.findById(orgId).select(
        "name organizationName plan"
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      if (user.plan !== "pro") {
        return res.status(403).json({
          message: "The AI Assistant is only available for Pro users.",
        });
      }

    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({
        message: "Chat title is required",
      });
    }
    const chatCount = await Conversation.countDocuments({
        organization: orgId,
      });
      if (chatCount >= 10) {
        return res.status(400).json({
          message: "You have reached the maximum of 10 conversations.",
        });
      }

    const chatId = new mongoose.Types.ObjectId();

    const chat = await Conversation.create({
      _id: chatId,
      organization: orgId,
      title: title.trim(),
      threadId: chatId.toString(),
    });


      return res.status(201).json(chat);

  } catch (error) {
    console.error("Failed to create chat:", error);

    res.status(500).json({
      message: "Failed to create chat",
    });
  }
})
);

router.get("/:id/messages/:chatId",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
  try {
    const chatId  = req.params.chatId;
    const orgId = req.params.id;

    const chat = await Conversation.findOne({
      _id: chatId,
      organization: orgId,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    const messages = await Message.find({
      chat: chatId,
    })
      .sort({ createdAt: 1 })
      .select("_id role content createdAt");

    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);

    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
})
);

router.post("/:id/messages/:chatId",
  verifyTokenAndAuthorization,chatMessageLimiter,asyncHandler(async(req,res)=>{
  const chatId  = req.params.chatId;
  const orgId = req.params.id;
  const { content } = req.body;
  try {

    if (!content?.trim()) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }
    
    const chat = await Conversation.findOne({
      _id: chatId,
      organization: orgId,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    const userMessage = await Message.create({
      chat: chat._id,
      role: "user",
      content: content.trim(),
    });
    const agentData = await chatWithAI({
    message: content.trim(),
    organizationId: chat.organization.toString(),
    threadId: chat.threadId,
  });
  const assistantMessage = await Message.create({
    chat: chat._id,
    role: "assistant",
    content: agentData.message,
  });

  chat.updatedAt = new Date();
  await chat.save();
  return res.status(201).json({assistantMessage});
  } catch (error) {
   console.error("Failed to send message:", {status: error.response?.status,
    message: error.message});
    res.status(500).json({
      message: "Failed to send message",
    });
  }
})
);

router.delete("/:id/:chatId",verifyTokenAndAuthorization,asyncHandler(async (req, res) => {
    const orgId = req.params.id;
    const chatId = req.params.chatId;
    try {
      const chat = await Conversation.findOne({
        _id: chatId,
        organization: orgId,
      });

      if (!chat) {
        return res.status(404).json({
          message: "Chat not found",
        });
      }
      await Message.deleteMany({
        chat: chatId,
      });

      await deleteAIThread(chat.threadId);
      await Conversation.deleteOne({_id: chatId,});
      res.status(200).json({
        message: "Conversation deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete chat:", error);

      res.status(500).json({
        message: "Failed to delete conversation",
      });
    }
  })
);

export default router; 