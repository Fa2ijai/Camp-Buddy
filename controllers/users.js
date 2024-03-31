const User = require("../models/user");

// @desc    Update admin ban user
// @route   Update /api/v1/users/ban/:id
// @access  Private
exports.banUser = async (req, res, next) => {
  const userId = req.params.userId;
  console.log(userId);
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { ban: Date.now() + 30 * 24 * 60 * 60 * 1000 }, //ban for 30 days
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user,
      message: "User banned successfully for 30 days",
    });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
