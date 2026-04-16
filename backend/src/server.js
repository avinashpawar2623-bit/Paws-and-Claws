const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./config/database");
const User = require("./models/User");

const startServer = async () => {
  try {
    try {
      await connectDatabase(env.mongoUri);
    } catch (dbError) {
      console.warn(`Database connection skipped: ${dbError.message}`);
    }

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: env.clientUrl,
        credentials: true,
      },
    });

    io.use(async (socket, next) => {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      try {
        const payload = jwt.verify(token, env.jwtSecret);
        const user = await User.findById(payload.sub).select("_id role");
        if (!user) return next(new Error("Unauthorized"));
        socket.user = user;
        return next();
      } catch (_error) {
        return next(new Error("Unauthorized"));
      }
    });

    io.on("connection", (socket) => {
      if (socket.user?._id) {
        socket.join(`user:${socket.user._id.toString()}`);
      }
    });

    app.set("io", io);

    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode.`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
