const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server error";

  if (err.code === 11000) {
    status = 409;
    // Kis collection me duplicate aaya: sirf 'users' ke liye email wala message sahi hai
    const coll = /collection: [^.\s]+\.(\w+)/.exec(err.message)?.[1];
    message =
      coll === "users"
        ? "An account with this email already exists"
        : "This record already exists (duplicate entry)";
    console.error("Duplicate key error:", err.message); // isme collection aur index ka naam dikhta hai
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.name === "MulterError") {
    status = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File must not be larger than 5MB"
        : err.message;
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    status = 401;
    message = "Your session is invalid or has expired. Please log in again.";
  } else if (
    err.name === "MongooseServerSelectionError" ||
    /buffering/i.test(message)
  ) {
    status = 503;
    message = "Service is temporarily unavailable. Please try again shortly.";
  }

  if (status >= 500) console.error(err);
  if (res.headersSent) return next(err);
  res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
