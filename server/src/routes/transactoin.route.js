const { Router } = require('express')
const { authMiddleware, authSystemUserMiddleware, authAdminMiddleware } = require("../middlewares/auth.middleware")
const transactionController = require("../controllers/transaction.controller")
const transactionRouter = Router();

/**
 * - GET /api/transactions
 * - Returns all transactions for the authenticated user's accounts
 */
transactionRouter.get("/", authMiddleware, transactionController.getTransactions);

/**
 * - POST /api/transactions/
 * - Creates a new transaction
 */
transactionRouter.post("/", authMiddleware, transactionController.createTransaction);

/**
 * - POST /api/transactions/admin/fund
 * - Admin only: add money to any account by ID
 */
transactionRouter.post("/admin/fund", authAdminMiddleware, transactionController.adminFundAccount);

/**
 * - POST /api/transactions/system/initial-funds
 * - Creates an initial deposit by system user only.(For Admins)
 */
transactionRouter.post("/system/initial-funds", authSystemUserMiddleware, transactionController.createInitialFundsTransaction);

module.exports = transactionRouter;