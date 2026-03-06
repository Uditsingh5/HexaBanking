const accountModel = require("../models/account.model");

/**
 * - Create Account Controller
 * - POST /api/account
 * - Allows users to create multiple accounts
 */
const createAccountController = async (req, res) => {
  try {
    const { currency } = req.body;
    const account = await accountModel.create({
      user: req.user._id,
      currency: currency || "INR",
      status: "active"
    });
    const balance = await account.getBalance();
    return res.status(201).json({ 
      accountId: account._id, 
      account, 
      balance,
      message: "Account created successfully"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: "failed" });
  }
}

/**
 * - Get All Accounts Controller
 * - GET /api/accounts
 * - Returns all accounts for the authenticated user
 */
const getAllAccountsController = async (req, res) => {
  try {
    const accounts = await accountModel.find({ 
      user: req.user._id 
    }).sort({ createdAt: -1 });
    
    // Get balance for each account
    const accountsWithBalance = [];
    for (const account of accounts) {
      const balance = await account.getBalance();
      accountsWithBalance.push({
        accountId: account._id,
        account: account.toObject(),
        balance
      });
    }
    
    return res.status(200).json({
      count: accountsWithBalance.length,
      accounts: accountsWithBalance
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: "failed" });
  }
};

/**
 * - Get User Account Controller
 * - GET /api/account/:accountId
 * - Returns a specific account with balance for the authenticated user
 */
const getUserAccountController = async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id
    });
    
    if (!account) {
      return res.status(404).json({ message: "Account not found or unauthorized" });
    }
    
    const balance = await account.getBalance();
    return res.status(200).json({
      accountId: account._id,
      account,
      balance
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: "failed" });
  }
};


module.exports = {
  createAccountController,
  getAllAccountsController,
  getUserAccountController
}