const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true,"Txn must be associated with a from Account."],
    index: true
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true,"Txn must be associated with a to Account."],
    index: true
  },
  status:{
    type:String,
    enum: {
      values:["pending","completed","failed","reversed"],
    },
    default: "pending"
  },
  amount: {
    type: Number,
    required: [true,"Amount is required for creating the txn."],
    min: [0,"Txn can't be negative."]
  },
  idempotencyKey: {
    type: String,
    required: [true,"Idempocency key is required to create the txn"],
    index: true,
    unique: true
  }
},{
  timestamps: true
})

// client side generates this idempotency key. and is not repeated.

const transactionModel = mongoose.model("transaction",transactionSchema);;

module.exports = transactionModel;