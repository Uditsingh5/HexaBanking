const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const accountController = require('../controllers/account.controller');

/**
 * - Get All Accounts route (must come before /:accountId)
 * - GET /api/account
 * - Returns all accounts for the authenticated user
 */
router.get("/", authMiddleware, accountController.getAllAccountsController);

/**
 * - Create Account route
 * - POST /api/account
 * - Creates a new account for the authenticated user
 */
router.post("/", authMiddleware, accountController.createAccountController);

/**
 * - Get Single Account route
 * - GET /api/account/:accountId
 * - Returns a specific account with balance
 */
router.get("/:accountId", authMiddleware, accountController.getUserAccountController);

module.exports = router;