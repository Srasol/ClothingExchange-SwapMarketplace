const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      location,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone?.trim() || "",
      location: location?.trim() || "",
    });

    return res.status(201).json({
      message: "Registration Successful",

      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        gender: user.gender || "",
        dateOfBirth:
          user.dateOfBirth || null,
        profileImage:
          user.profileImage || "",
        role: user.role,
      },
    });
  } catch (err) {
    console.error(
      "Registration Error:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } =
      req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }

    const passwordMatched =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatched) {
      return res.status(400).json({
        message: "Wrong Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Login Successful",
      token,

      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        gender: user.gender || "",
        dateOfBirth:
          user.dateOfBirth || null,
        profileImage:
          user.profileImage || "",
        role: user.role,
      },
    });
  } catch (err) {
    console.error(
      "Login Error:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};

// Get All Users
exports.getUsers = async (
  req,
  res
) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({
        name: 1,
      });

    return res.status(200).json(
      users
    );
  } catch (err) {
    console.error(
      "Get Users Error:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};