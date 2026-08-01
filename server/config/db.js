const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log(
      "Connecting to MongoDB Atlas..."
    );

    const connection =
      await mongoose.connect(
        process.env.MONGO_URI,
        {
          serverSelectionTimeoutMS: 30000,
          connectTimeoutMS: 30000,
        }
      );

    console.log(
      `MongoDB Connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error(
      "MongoDB Connection Error:",
      error.message
    );

    process.exit(1);
  }
};

module.exports = connectDB;