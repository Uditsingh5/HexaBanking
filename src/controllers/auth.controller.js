const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlacklistModel = require("../models/blacklist.model");


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
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token);
    await emailService.sendRegistrationEmail(user.email, user.name);
    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
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

const userLoginController = async (req,res) => {
  const {email,password} = req.body;
  const user = await userModel.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      message: "user not found!",
    });
  }
  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return res.status(401).json({
      message: "Email or Password is Invalid!"
    })
  }
  const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token);
    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    })
}

/**
 * - User Logout Controller
 * - POST /api/auth/logout
 */
const userLogoutController = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: "No token provided!" });
  }
  res.clearCookie("token");
  await tokenBlacklistModel.create({ token });
  return res.status(200).json({ message: "Logged out successfully!" });

}

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController
}