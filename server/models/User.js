const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    location: {
      type: String,
    },

    // 👇 Add these fields here
    bio: {
  type: String,
  default: "",
},

gender: {
  type: String,
  default: "",
},

dateOfBirth: {
  type: Date,
  default: null,
},

profileImage: {
  type: String,
  default: "",
},

    // Existing field
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);