const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const currencyService = require("../services/currency.service")
const mongoose = require("mongoose")

/**
 * - Get all transactions for the authenticated user
 * - GET /api/transactions
 */
async function getTransactions(req, res) {
    try {
        // Find all accounts belonging to the user
        const userAccounts = await accountModel.find({ user: req.user._id })
        const accountIds = userAccounts.map(a => a._id)

        if (accountIds.length === 0) {
            return res.status(200).json({ count: 0, transactions: [] })
        }

        // Find all transactions where fromAccount or toAccount is one of the user's accounts
        const transactions = await transactionModel.find({
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ]
        }).sort({ createdAt: -1 }).limit(100)

        return res.status(200).json({
            count: transactions.length,
            transactions
        })
    } catch (error) {
        console.error("getTransactions error:", error)
        return res.status(500).json({ message: error.message })
    }
}

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */

async function createTransaction(req, res) {

    /**
     * 1. Validate request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "FromAccount, toAccount, amount and idempotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    /**
     * 2. Validate idempotency key
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "completed") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })

        }

        if (isTransactionAlreadyExists.status === "pending") {
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        }

        if (isTransactionAlreadyExists.status === "failed") {
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }

        if (isTransactionAlreadyExists.status === "reversed") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }
    }

    /**
     * 3. Check account status
     */

    if (fromUserAccount.status !== "active" || toUserAccount.status !== "active") {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be active to process transaction"
        })
    }

    /**
     * 4. Derive sender balance from ledger
     */
    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    const fromCurrency = fromUserAccount.currency || "INR"
    const toCurrency = toUserAccount.currency || "INR"

    let exchangeRate = 1.0
    let targetAmount = amount

    if (fromCurrency !== toCurrency) {
        const conversion = currencyService.convertAmount(amount, fromCurrency, toCurrency)
        exchangeRate = conversion.rate
        targetAmount = conversion.convertedAmount
    }

    let transaction;
    let session;
    try {

        /**
         * 5. Create transaction (PENDING)
         */
        session = await mongoose.startSession()
        session.startTransaction()

        transaction = (await transactionModel.create([ {
            fromAccount,
            toAccount,
            amount,
            fromCurrency,
            toCurrency,
            targetAmount,
            exchangeRate,
            type: "transfer",
            idempotencyKey,
            status: "pending"
        } ], { session }))[ 0 ]

        /**
         * 6. Create DEBIT ledger entry in source currency
         */
        await ledgerModel.create([ {
            account: fromAccount,
            amount: -amount,
            transaction: transaction._id,
            type: "debit"
        } ], { session })

        /**
         * 7. Create CREDIT ledger entry in destination currency
         */
        await ledgerModel.create([ {
            account: toAccount,
            amount: targetAmount,
            transaction: transaction._id,
            type: "credit"
        } ], { session })

        /**
         * 8. Mark transaction COMPLETED
         */
        transaction = await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "completed" },
            { session, new: true }
        )

        /**
         * 9. Commit MongoDB session
         */
        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }

        console.error("Transaction error:", error)

        return res.status(400).json({
            message: "Transaction is pending due to an error, please retry after some time. If the issue persists, contact support.",
            error: error.message
        })

    }
    /**
     * 10. Send email notifications to both sender and receiver
     */
    try {
        // Get receiver's account and user details
        const receiverAccount = await accountModel.findById(toAccount).populate('user');
        
        if (receiverAccount && receiverAccount.user) {
            // Calculate balances after transaction
            const senderBalance = await fromUserAccount.getBalance();
            const receiverBalance = await receiverAccount.getBalance();
            
            // Send debit email to sender with recipient name and sender's currency
            await emailService.sendDebitEmail(
                req.user.email,
                req.user.name,
                amount,
                transaction._id,
                receiverAccount.user.name,
                senderBalance,
                fromCurrency
            );
            
            // Send credit email to receiver with sender name and receiver's currency
            await emailService.sendCreditEmail(
                receiverAccount.user.email,
                receiverAccount.user.name,
                targetAmount,
                transaction._id,
                req.user.name,
                receiverBalance,
                toCurrency
            );
        }
    } catch (error) {
        console.error("Email notification failed:", error)
        // Don't fail the response if email fails - transaction already completed
    }

    return res.status(201).json({
        message: "Transaction completed successfully",
        transactionType: "debit",
        transactionStatus: "completed",
        details: {
            amount: amount,
            debitedFrom: fromAccount,
            creditedTo: toAccount,
            transactionId: transaction._id
        },
        transaction: transaction
    })

}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    let transaction;
    let session;
    try {
        session = await mongoose.startSession()
        session.startTransaction()

        transaction = (await transactionModel.create([ {
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "pending"
        } ], { session }))[ 0 ]

        await ledgerModel.create([ {
            account: fromUserAccount._id,
            amount: -amount,
            transaction: transaction._id,
            type: "debit"
        } ], { session })

        await ledgerModel.create([ {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "credit"
        } ], { session })

        transaction = await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "completed" },
            { session, new: true }
        )

        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }

        console.error("Initial funds transaction error:", error)

        return res.status(400).json({
            message: "Initial funds transaction failed, please retry",
            error: error.message
        })
    }

    // Send credit email to receiver
    try {
        const receiverAccount = await accountModel.findById(toAccount).populate('user');
        const senderAccount = await accountModel.findById(fromUserAccount._id).populate('user');
        
        if (receiverAccount && receiverAccount.user && senderAccount && senderAccount.user) {
            const receiverBalance = await receiverAccount.getBalance();
            
            await emailService.sendCreditEmail(
                receiverAccount.user.email,
                receiverAccount.user.name,
                amount,
                transaction._id,
                senderAccount.user.name,
                receiverBalance
            );
        }
    } catch (error) {
        console.error("Email notification failed:", error)
        // Don't fail the response if email fails - transaction already completed
    }

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })
}

/**
 * - Admin: Fund any account directly
 * - POST /api/transactions/admin/fund
 * - Admin only — creates a CREDIT ledger entry, adding money to any account
 */
async function adminFundAccount(req, res) {
    const { toAccount, amount, note } = req.body

    if (!toAccount || !amount) {
        return res.status(400).json({ message: "toAccount and amount are required" })
    }

    if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be greater than zero" })
    }

    const targetAccount = await accountModel.findById(toAccount)
    if (!targetAccount) {
        return res.status(404).json({ message: "Account not found" })
    }

    if (targetAccount.status !== "active") {
        return res.status(400).json({ message: "Target account must be active" })
    }

    let session
    try {
        session = await mongoose.startSession()
        session.startTransaction()

        // Create a synthetic transaction record
        const transaction = (await transactionModel.create([{
            fromAccount: toAccount, // admin funding - no real source
            toAccount,
            amount,
            fromCurrency: targetAccount.currency || "INR",
            toCurrency: targetAccount.currency || "INR",
            targetAmount: amount,
            exchangeRate: 1.0,
            type: "admin_fund",
            idempotencyKey: `admin-fund-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            status: "completed"
        }], { session }))[0]

        // Create CREDIT ledger entry only — admin mints the money
        await ledgerModel.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "credit"
        }], { session })

        await session.commitTransaction()
        session.endSession()

        const newBalance = await targetAccount.getBalance()

        return res.status(201).json({
            message: `Successfully added ${amount} to account`,
            transaction,
            newBalance
        })
    } catch (error) {
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        console.error("Admin fund error:", error)
        return res.status(500).json({ message: "Failed to fund account", error: error.message })
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    getTransactions,
    adminFundAccount
}