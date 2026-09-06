const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

/**
 * - GET /api/auth/me
 * - Returns current authenticated user including role
 */
router.get("/me", authMiddleware, authController.getMeController);

/**
 * - Register User route
 * - POST /api/auth/register
 */
router.post("/register", authController.userRegisterController);

/**
 * - Login User route
 * - POST /api/auth/login
 */
router.post("/login", authController.userLoginController);

/**
 * - Logout User route
 * - POST /api/auth/logout
 */
router.post("/logout", authController.userLogoutController);

module.exports = router;