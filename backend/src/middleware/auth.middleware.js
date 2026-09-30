const { getAuth, clerkClient } = require("@clerk/express");
const User = require("../models/user.model");

module.exports = async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);
    if (!userId)
      return res.status(401).json({ message: "Please sign in to continue." });
    let user = await User.findOne({ clerkId: userId });
    // First sign-in can arrive before the Clerk webhook.
    if (!user) {
      const profile = await clerkClient.users.getUser(userId);
      const email = profile.emailAddresses.find(
        (item) => item.id === profile.primaryEmailAddressId,
      )?.emailAddress;
      if (!email)
        return res
          .status(409)
          .json({
            message: "Add an email address to your account to continue.",
          });
      user = await User.findOneAndUpdate(
        { clerkId: userId },
        {
          $setOnInsert: {
            clerkId: userId,
            email,
            fullName:
              [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
              profile.username ||
              email.split("@")[0],
            profilePic: profile.imageUrl || "",
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication failed:", error.message);
    res
      .status(503)
      .json({ message: "We could not load your account. Please try again." });
  }
};
