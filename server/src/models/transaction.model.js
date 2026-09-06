const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "Txn must be associated with a from Account."],
    index: true
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "Txn must be associated with a to Account."],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ["pending", "completed", "failed", "reversed"],
    },
    default: "pending"
  },
  type: {
    type: String,
    enum: ["transfer", "admin_fund"],
    default: "transfer"
  },
  amount: {
    type: Number,
    required: [true, "Amount is required for creating the txn."],
    min: [0, "Txn can't be negative."]
  },
  fromCurrency: {
    type: String,
    enum: ["INR", "USD", "EUR"]
  },
  toCurrency: {
    type: String,
    enum: ["INR", "USD", "EUR"]
  },
  targetAmount: {
    type: Number,
    min: [0, "Target amount can't be negative."]
  },
  exchangeRate: {
    type: Number,
    default: 1.0
  },
  idempotencyKey: {
    type: String,
    required: [true, "Idempocency key is required to create the txn"],
    index: true,
    unique: true
  }
}, {
  timestamps: true
});

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel;