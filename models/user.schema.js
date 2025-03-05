const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, 
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  depositAmount: { type: Number, default: 0 },
  referralPercentage: { type: Number, default: 25 }, // Default 25%
});

const User = mongoose.model("User", userSchema);
module.exports = User;
