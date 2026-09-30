const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, maxlength: 5000 },
    image: String,
    video: String,
    clientMessageId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
module.exports = mongoose.model("Message", messageSchema);
