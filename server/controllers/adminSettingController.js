const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "Clothing Exchange",
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    allowRegistration: {
      type: Boolean,
      default: true,
    },

    allowListings: {
      type: Boolean,
      default: true,
    },

    allowSwaps: {
      type: Boolean,
      default: true,
    },

    supportEmail: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Settings =
  mongoose.models.Settings ||
  mongoose.model(
    "Settings",
    settingsSchema
  );

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error(
      "Get admin settings error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load settings.",
      error: error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    const allowedFields = [
      "siteName",
      "maintenanceMode",
      "allowRegistration",
      "allowListings",
      "allowSwaps",
      "supportEmail",
    ];

    allowedFields.forEach((field) => {
      if (
        Object.prototype.hasOwnProperty.call(
          req.body,
          field
        )
      ) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();

    return res.status(200).json({
      message: "Settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error(
      "Update admin settings error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update settings.",
      error: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};