const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

const sendToken = (user, status, res) => {
  const token = user.getSignedJwt();
  res.status(status).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// POST /api/v1/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password)
    return fail(res, 400, "Name, email and password are required");
  if (password.length < 8)
    return fail(res, 400, "Password must be at least 8 characters");

  if (await User.exists({ email: email.toLowerCase().trim() })) {
    return fail(res, 409, "An account with this email already exists");
  }
  // role kabhi body se nahi lete: koi khud ko admin na bana sake
  const user = await User.create({ name, email, password, role: "user" });
  sendToken(user, 201, res);
});

// POST /api/v1/auth/login  (user + admin dono)
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return fail(res, 400, "Please enter your email and password");

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password",
  );
  if (!user || !(await user.matchPassword(password)))
    return fail(res, 401, "Incorrect email or password");
  sendToken(user, 200, res);
});

// GET /api/v1/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});
