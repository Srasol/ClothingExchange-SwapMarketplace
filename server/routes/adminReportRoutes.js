const express = require("express");

const router = express.Router();

const adminAuth = require("../middleware/adminAuth");

const {
  getReports,
} = require("../controllers/adminReportController");

router.get(
  "/",
  adminAuth,
  getReports
);

module.exports = router;