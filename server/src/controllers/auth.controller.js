const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlacklistModel = require("../models/blacklist.model");

/**
 * Shared cookie configuration.
 * - httpOnly: prevents JavaScript from reading the token (XSS protection)
 * - sameSite "lax": allows the cookie on same-site navigations and
 *   top-level GET requests while still being sent on same-origin
 *   AJAX calls (required for the Vite proxy in dev)
 * - secure: only send over HTTPS in production
 * - maxAge: 3 days in ms, matches the JWT expiry
 */
const isProduction = process.env.NODE_ENV === "production";
const COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};

/**
 * - User register controller
 * - POST /api/auth/register
 */
const userRegisterController = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const isExist = await userModel.findOne({ email });
    if (isExist) {
      return res.status(422).json({
        message: "User already exists!",
        status: "failed",
      });
    }
    const user = await userModel.create({ email, password, name });
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server configuration error: JWT_SECRET environment variable is missing on the server.",
        status: "failed",
      });
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    await emailService.sendRegistrationEmail(user.email, user.name);
    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      message: err.message || "Signup failed!",
      status: "failed",
    });
  }
};

/**
 * - Userlogin Controller
 * - POST /api/auth/login
 */

const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        message: "User not found!",
      });
    }
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        message: "Email or Password is Invalid!"
      });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server configuration error: JWT_SECRET environment variable is missing on the server.",
        status: "failed",
      });
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );
    res.cookie("token", token, COOKIE_OPTIONS);
    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      message: err.message || "Login failed!",
      status: "failed",
    });
  }
};


/**
 * - User Logout Controller
 * - POST /api/auth/logout
 */
const userLogoutController = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: "No token provided!" });
  }
  res.clearCookie("token", COOKIE_OPTIONS);
  await tokenBlacklistModel.create({ token });
  return res.status(200).json({ message: "Logged out successfully!" });

}

/**
 * - Get current user (me)
 * - GET /api/auth/me
 */
const getMeController = (req, res) => {
  return res.status(200).json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    }
  });
};

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController,
  getMeController,
}