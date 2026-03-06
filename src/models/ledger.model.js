const mongoose = require('mongoose');

const ledgerSchema = mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true,"Ledger must be assciated with an account!"],
    index: true, // bcz we have registry of various txn... so indexing required.
    immutable: true
  },
  amount: {
    type: Number,
    required: [true,"Amount is required for creating entry."]
  },
  transaction:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction",
    required: [true,"Ledger must be assciated with a transaction!"],
    index: true,
    immutable: true
  },
  type: {
    type: String,
    enum: {
      values: ["credit","debit"],
      message: "type can be debit or credit."
    },
    required: [true,"Ledger type is required!"],
    immutable: true
  }
})

function preventLedgerModification(){
  throw new Error("Ledger entries are immutable and cannot be modified or deleted");
}

ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification);
ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('updateMany',preventLedgerModification);
ledgerSchema.pre('deleteOne',preventLedgerModification);
ledgerSchema.pre('remove',preventLedgerModification);
ledgerSchema.pre('delete',preventLedgerModification);

const ledgerModel = mongoose.model("ledger",ledgerSchema);

module.exports = ledgerModel;