const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

const LOCAL_CLIENT_URL =
  "http://localhost:5173";

const DEPLOYED_CLIENT_URL =
  process.env.CLIENT_URL;

const allowedOrigins = [
  LOCAL_CLIENT_URL,
  DEPLOYED_CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow Postman and server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(
        `CORS blocked request from: ${origin}`
      )
    );
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.use(
  "/api/auth",
  require("./routes/authroutes")
);

app.use(
  "/api/listings",
  require("./routes/listingRoutes")
);

app.use(
  "/api/swaps",
  require("./routes/swapRoutes")
);

app.use(
  "/api/messages",
  require("./routes/messageRoutes")
);

app.use(
  "/api/admin",
  require("./routes/adminRoutes")
);

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
  require(
    "./routes/adminNotificationRoutes"
  )
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

app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "Clothing Exchange API Running",
  });
});

const server =
  http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  socket.on("join", (userId) => {
    if (!userId) {
      return;
    }

    onlineUsers.set(
      String(userId),
      socket.id
    );

    socket.userId =
      String(userId);

    io.emit(
      "onlineUsers",
      Array.from(
        onlineUsers.keys()
      )
    );
  });

  socket.on(
    "sendMessage",
    (message) => {
      const receiverId =
        typeof message.receiver ===
        "object"
          ? message.receiver?._id
          : message.receiver;

      if (!receiverId) {
        return;
      }

      const receiverSocket =
        onlineUsers.get(
          String(receiverId)
        );

      if (receiverSocket) {
        io.to(receiverSocket).emit(
          "receiveMessage",
          message
        );
      }
    }
  );

  socket.on(
    "typing",
    ({ sender, receiver }) => {
      const receiverSocket =
        onlineUsers.get(
          String(receiver)
        );

      if (receiverSocket) {
        io.to(receiverSocket).emit(
          "typing",
          {
            sender:
              String(sender),
          }
        );
      }
    }
  );

  socket.on(
    "stopTyping",
    ({ sender, receiver }) => {
      const receiverSocket =
        onlineUsers.get(
          String(receiver)
        );

      if (receiverSocket) {
        io.to(receiverSocket).emit(
          "stopTyping",
          {
            sender:
              String(sender),
          }
        );
      }
    }
  );

  socket.on(
    "disconnect",
    () => {
      if (socket.userId) {
        onlineUsers.delete(
          socket.userId
        );
      }

      io.emit(
        "onlineUsers",
        Array.from(
          onlineUsers.keys()
        )
      );

      console.log(
        "Socket disconnected:",
        socket.id
      );
    }
  );
});

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();