const mongoose = require("mongoose");
const User = require("../models/user.model");
const Message = require("../models/message.model");
const { uploadChatMedia } = require("../lib/imagekit");
const { io, userRoom } = require("../lib/socket");

const publicUser = "_id fullName profilePic";
const validId = (id) => mongoose.isObjectIdOrHexString(id);

async function getUsersForSidebar(req, res, next) {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select(publicUser)
      .sort({ fullName: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function getConversationForSideBar(req, res, next) {
  try {
    const id = req.user._id;
    const conversations = await Message.aggregate([
      { $match: { $or: [{ senderId: id }, { receiverId: id }] } },
      { $sort: { _id: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", id] }, "$receiverId", "$senderId"],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          fullName: "$user.fullName",
          profilePic: "$user.profilePic",
          lastMessage: 1,
        },
      },
      { $sort: { "lastMessage._id": -1 } },
    ]);
    res.json(conversations);
  } catch (error) {
    next(error);
  }
}

async function getMessages(req, res, next) {
  try {
    const partner = req.params.id;
    if (!validId(partner))
      return res.status(400).json({ message: "Invalid conversation." });
    if (req.query.before && !validId(req.query.before))
      return res.status(400).json({ message: "Invalid message cursor." });
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: partner },
        { senderId: partner, receiverId: req.user._id },
      ],
      ...(req.query.before ? { _id: { $lt: req.query.before } } : {}),
    })
      .sort({ _id: -1 })
      .limit(50);
    res.json({ messages: messages.reverse(), hasMore: messages.length === 50 });
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    const clientMessageId = req.body.clientMessageId;
    if (!validId(receiverId) || String(senderId) === receiverId)
      return res.status(400).json({ message: "Choose a valid recipient." });
    if (!text && !req.file)
      return res
        .status(400)
        .json({ message: "Write a message or add a photo." });
    if (text.length > 5000)
      return res
        .status(400)
        .json({ message: "Messages can contain up to 5,000 characters." });
    if (clientMessageId && !/^[a-zA-Z0-9-]{16,80}$/.test(clientMessageId))
      return res.status(400).json({ message: "Invalid message identifier." });
    if (clientMessageId) {
      const existing = await Message.findOne({ senderId, clientMessageId });
      if (existing) return res.json({ newMessage: existing });
    }
    if (!(await User.exists({ _id: receiverId })))
      return res
        .status(404)
        .json({ message: "This account is no longer available." });
    const media = {};
    if (req.file) {
      media[req.file.mimetype.startsWith("video/") ? "video" : "image"] =
        await uploadChatMedia(req.file);
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      ...media,
      ...(clientMessageId ? { clientMessageId } : {}),
    });
    io.to(userRoom(receiverId))
      .to(userRoom(senderId))
      .emit("newMessage", newMessage);
    res.status(201).json({ newMessage });
  } catch (error) {
    if (error.code === 11000 && req.body.clientMessageId) {
      try {
        const existing = await Message.findOne({
          senderId: req.user._id,
          clientMessageId: req.body.clientMessageId,
        });
        if (existing) return res.json({ newMessage: existing });
      } catch (lookupError) {
        return next(lookupError);
      }
    }
    next(error);
  }
}
module.exports = {
  getUsersForSidebar,
  getConversationForSideBar,
  getMessages,
  sendMessage,
};
