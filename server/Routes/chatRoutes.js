import express from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Conversation from "../Models/Conversation.js";
import Message from "../Models/Message.js";
import { verifyTokenAndAuthorization} from '../Middlewares/JWTauth.js'
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
    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({
        message: "Chat title is required",
      });
    }
    const chatId = new mongoose.Types.ObjectId();

    const chat = await Conversation.create({
      _id: chatId,
      organization: orgId,
      title: title.trim(),
      threadId: chatId.toString(),
    });

    res.status(201).json(chat);
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

router.post("/:id/messages/:chatId",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
  try {
    const chatId  = req.params.chatId;
    const orgId = req.params.id;
    const { content } = req.body;

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

    // Save user message
    const userMessage = await Message.create({
      chat: chat._id,
      role: "user",
      content: content.trim(),
    });

    // Call Python AI agent
    const agentResponse = await fetch(
      `${process.env.AGENT_API_URL}/api/agent/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content.trim(),
          organization_id: chat.organization.toString(),
          thread_id: chat.threadId,
        }),
      }
    );

    if (!agentResponse.ok) {
      throw new Error(
        `Agent API returned ${agentResponse.status}`
      );
    }

    const agentData = await agentResponse.json();

    const assistantContent = agentData.message;

    // Save assistant message
    const assistantMessage = await Message.create({
      chat: chat._id,
      role: "assistant",
      content: assistantContent,
    });

    // Update chat's last activity
    chat.updatedAt = new Date();
    await chat.save();

    res.status(201).json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error("Failed to send message:", error);

    res.status(500).json({
      message: "Failed to send message",
    });
  }
})
);

export default router; 