const { Router } = require('express')
const authMiddleware = require("../middlewares/auth.middleware")
const transactionController = require("../controllers/transaction.controller")
const transactionRouter = Router();

/**
 * - POST /api/transactions/
 * - Creates a new transaction
 */
transactionRouter.post("/", authMiddleware.authMiddleware, transactionController.createTransaction);

/**
 * - POST /api/transactions/system/initial-funds
 * - Creates an initial deposit by system user only.(For Admins)
 */
transactionRouter.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction);

module.exports = transactionRouter;