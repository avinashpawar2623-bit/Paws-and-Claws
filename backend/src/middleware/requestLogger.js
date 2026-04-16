const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    if (!req.path.startsWith("/api")) {
      return;
    }

    const durationMs = Date.now() - start;
    // Keep logs compact so production traffic remains readable.
    console.info(
      `[api] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
    );
  });

  next();
};

module.exports = requestLogger;
