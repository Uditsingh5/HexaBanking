const UserModel = require("../models/user.model");
const user = require("../models/user.model");
const jwt = require("jsonwebtoken");

const tokenBlacklistModel = require("../models/blacklist.model");

// Middleware to authenticate users

async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token missing!"
    })
  }
  const isBlacklisted = await tokenBlacklistModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({
      message: "Unauthorized access, token is expired!"
    })
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Server error: JWT_SECRET not set" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const foundUser = await user.findById(decoded.userId);
    if (!foundUser) {
      return res.status(401).json({
        message: "Unauthorized access, user not found!",
      });
    }
    req.user = foundUser;
    return next();
  }
  catch (error) {
    return res.status(401).json({
      message: "Unauthorized access, token is Invalid!"
    })
  }
}

// Middleware to authenticate system users (admin).

async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token missing!"
    })
  }

  const isBlacklisted = await tokenBlacklistModel.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({
      message: "Unauthorized access, token is expired!"
    })
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Server error: JWT_SECRET not set" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const foundUser = await user.findById(decoded.userId).select("+systemUser");
    if (!foundUser) {
      return res.status(401).json({
        message: "Unauthorized access, user not found!",
      });
    }
    if (!foundUser.systemUser) {
      return res.status(403).json({
        message: "Unauthorized access, user is not a system user!",
      });
    }
    req.user = foundUser;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access, token is Invalid!"
    })
  }
}

module.exports = {
  authMiddleware,
  authSystemUserMiddleware,
  authAdminMiddleware: async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized access, token missing!" });

    const isBlacklisted = await tokenBlacklistModel.findOne({ token });
    if (isBlacklisted) return res.status(401).json({ message: "Unauthorized access, token is expired!" });

    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Server error: JWT_SECRET not set" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const foundUser = await user.findById(decoded.userId);
      if (!foundUser) return res.status(401).json({ message: "Unauthorized access, user not found!" });
      if (foundUser.role !== "admin") return res.status(403).json({ message: "Access denied. Admin only." });
      req.user = foundUser;
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized access, token is Invalid!" });
    }
  }
}