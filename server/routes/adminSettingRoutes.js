const express = require("express");

const router = express.Router();

const adminAuth = require("../middleware/adminAuth");

const {
  getSettings,
  updateSettings,
} = require("../controllers/adminSettingController");

router.get(
  "/",
  adminAuth,
  getSettings
);

router.put(
  "/",
  adminAuth,
  updateSettings
);

module.exports = router;