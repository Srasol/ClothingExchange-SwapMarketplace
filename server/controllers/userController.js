const User = require("../models/User");

// Get user profile
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    return res.status(500).json({
      message: "Unable to load user",
      error: error.message,
    });
  }
};

// Update logged-in user's profile
exports.updateUser = async (req, res) => {
  try {
    if (
      String(req.user.id) !==
      String(req.params.id)
    ) {
      return res.status(403).json({
        message:
          "You can update only your own profile",
      });
    }

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const textFields = [
      "name",
      "email",
      "phone",
      "location",
      "bio",
      "gender",
    ];

    textFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = String(
          req.body[field]
        ).trim();
      }
    });

    if (req.body.dateOfBirth !== undefined) {
      user.dateOfBirth =
        req.body.dateOfBirth || null;
    }

    if (req.file) {
      user.profileImage =
        `uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    const safeUser = await User.findById(
      updatedUser._id
    ).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "This email address is already being used.",
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        "Unable to update profile",
    });
  }
};