const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

/**
 * - Register User route
 * - POST /api/auth/register
 * - Register a new user
 */
router.post("/register",authController.userRegisterController)

/**
 * - Login User route
 * - POST /api/auth/login
 * - Authenticate user and return JWT token
 */
router.post("/login",authController.userLoginController)

/**
 * - Logout User route
 * - POST /api/auth/logout
 * - Logs out the user by clearing the JWT cookie
 */
router.post("/logout",authController.userLogoutController)

module.exports = router;