module.exports = (req, res) => {
  const { _id, fullName, email, profilePic } = req.user;
  res.status(200).json({ _id, fullName, email, profilePic });
};
