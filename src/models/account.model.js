const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true, "User must be associated with account!"],
    index: true
  },
  status: {
    type: String,
    enum: ["active", "frozen", "closed"],
    default: "active",
  },
  currency: {
    type: String,
    required: [true, "Currency is required for existence of account!"],
    enum: ["INR", "USD", "EUR"],
    default: "INR",
  },
  systemUser: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Have to learn this concept in depth. the name is aggregation pipeline.
accountSchema.methods.getBalance = async function () {
  const balance = await ledgerModel.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalAmount: {
          $sum: "$amount"  // Just sum all amounts (debits are already negative)
        }
      }
    },
    {
      $project: {
        _id: 0,
        balance: "$totalAmount"
      }
    }
  ])
  if(balance.length === 0){
    return 0;
  }
  else{
    return balance[0].balance;
  }
}

// Compound idx
accountSchema.index({ user: 1, status: 1 });

const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;