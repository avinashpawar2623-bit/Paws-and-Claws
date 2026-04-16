const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./config/database");

const startServer = async () => {
  try {
    try {
      await connectDatabase(env.mongoUri);
    } catch (dbError) {
      console.warn(`Database connection skipped: ${dbError.message}`);
    }

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode.`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
