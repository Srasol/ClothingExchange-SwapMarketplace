const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

dotenv.config();


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/listings", require("./routes/ListingRoutes"));
app.use("/api/swaps", require("./routes/swapRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use(
  "/api/notifications",
  require("./routes/notificationRoutes")
);

app.use(
  "/api/wishlist",
  require("./routes/wishlistRoutes")
);
app.use(
  "/api/admin/notifications",
  require("./routes/adminNotificationRoutes")
);
app.use(
  "/api/admin/reports",
  require("./routes/adminReportRoutes")
);
app.use(
  "/api/admin/settings",
  require("./routes/adminSettingRoutes")
);
app.use(
  "/api/users",
  require("./routes/userRoutes")
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/", (req, res) => {
  res.json({
    message: "Clothing Exchange API Running",
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;

    onlineUsers.set(String(userId), socket.id);
    socket.userId = String(userId);

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("sendMessage", (message) => {
    const receiverId =
      typeof message.receiver === "object"
        ? message.receiver._id
        : message.receiver;

    const receiverSocket = onlineUsers.get(String(receiverId));

    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", message);
    }
  });

  socket.on("typing", ({ sender, receiver }) => {
    const receiverSocket = onlineUsers.get(String(receiver));

    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", {
        sender: String(sender),
      });
    }
  });

  socket.on("stopTyping", ({ sender, receiver }) => {
    const receiverSocket = onlineUsers.get(String(receiver));

    if (receiverSocket) {
      io.to(receiverSocket).emit("stopTyping", {
        sender: String(sender),
      });
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
    }

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    console.log("Socket disconnected:", socket.id);
  });
});


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Server Running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();