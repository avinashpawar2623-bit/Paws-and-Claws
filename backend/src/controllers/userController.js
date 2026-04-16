const User = require("../models/User");

const getProfile = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

const updateProfile = async (req, res) => {
  const { name, phone, address, profileImage } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  user.name = name ?? user.name;
  user.phone = phone ?? user.phone;
  user.address = address ?? user.address;
  user.profileImage = profileImage ?? user.profileImage;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated.",
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
};

const listUsers = async (_req, res) => {
  const users = await User.find().select("-password -refreshToken");
  return res.status(200).json({ success: true, users });
};

const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  return res.status(200).json({ success: true, message: "User deleted." });
};

module.exports = { getProfile, updateProfile, listUsers, deleteUser };
