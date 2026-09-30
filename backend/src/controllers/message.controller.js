const User = require("../models/user.model");
const Message = require("../models/message.model");
const {hasImageKitConfig,uploadChatMedia} = require('../lib/imagekit');
const getUsersForSidebar = async (req, res) => {

  try {

    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({

      _id: { $ne: loggedInUserId },

    }).select("-clerkId");

    res.status(200).json(filteredUsers);

  } catch (e) {

    console.error("error in getUsersForSidebar", e.message);

    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getConversationForSideBar = async (req, res) => {

  try {

    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      // 1. Keep only the messages I sent or received.
      {
        $match: {
          $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        },
      },
      // 2. Collapse them into one row per chat partner, noting our latest message time.
      {
        $group: {
          // The partner is the other person on the message (not me).
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      // 3. Put the most recent conversation at the top.
      { $sort: { lastMessageAt: -1 } },
      // 4. Look up each partner's user profile (comes back as an array).
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      // 5. Pull that profile out of the array and make it the document.
      { $replaceRoot: { newRoot: { $first: "$user" } } },
      // 6. Hide the private clerkId field from the result.
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);

  } catch (error) {

    console.error("Error in getConversationsForSidebar:", error.message);

    res.status(500).json({ message: "Internal server error" });

  }

};

const getMessages = async (req, res) => {

  try {
    // destructure id which we cant the user to chat with
    const { id: userToChatId } = req.params;
    // get the current user's id
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (e) {
    console.log(e);
    res.status(500).json({message:"Internal Server Error"});
  }
};
const sendMessage = async(req,res)=>{
  try{
    const {text} = req.body;
    const {id: receiverId} = req.params;
    const senderId = req.user._id;
    
    let imageUrl;
    let videoUrl;

    if(req.file && !hasImageKitConfig()){
        return res.status(500).json({message:"No Media Upload Is Configured"});
    }
    const url = await uploadChatMedia(req.file);
    if(req.file.mimetype.StartsWith('video/')) videoUrl = url;
    else imageUrl = url;
    

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image:imageUrl,
      video:videoUrl
    });
    await newMessage.save();

    res.status(201).json({newMessage});
  }catch(e){
    console.error("errror in sendMessage",e.message);
    res.status(500).json({message:"Internal Server Error"});

  }
}
module.exports = { getUsersForSidebar, getConversationForSideBar, getMessages ,sendMessage};
