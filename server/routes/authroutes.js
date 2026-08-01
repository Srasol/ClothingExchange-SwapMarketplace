const express = require("express");
const router = express.Router();
const User = require("../models/User");

const authController = require("../controllers/authController");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/users", authController.getUsers);

module.exports = router;
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({
      role: { $ne: "admin" },
    }).select("name email location role");

    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Unable to load users",
    });
  }
});