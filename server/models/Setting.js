const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      default: "Clothing Exchange Marketplace",
    },

    websiteEmail: {
      type: String,
      default: "admin@example.com",
    },

    websitePhone: {
      type: String,
      default: "+91 9876543210",
    },

    websiteAddress: {
      type: String,
      default: "India",
    },

    logo: {
      type: String,
      default: "",
    },

    darkMode: {
      type: Boolean,
      default: false,
    },

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    pushNotifications: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Setting",
  settingSchema
);