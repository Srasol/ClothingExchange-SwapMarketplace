const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const profileUpload = require(
  "../middleware/profileUpload"
);

const {
  getUserById,
  updateUser,
} = require("../controllers/userController");

router.get("/:id", auth, getUserById);

router.put(
  "/:id",
  auth,
  profileUpload.single("profileImage"),
  updateUser
);

module.exports = router;