const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  htag: { type: Number, default: 0 }, // Total downline count
  referralPercentage: { type: Number, default: 25 }, // Default 25%
  depositAmount: { type: Number, default: 0 }, // Total deposited balance
  dummy: { type: Array, default: [] } // Store commission logs
});

const User = mongoose.model("User", userSchema);
module.exports = User;