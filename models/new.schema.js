// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, 
//   referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   htag: { type: Number, default: 0 }, // Total downline count
//   referralPercentage: { type: Number, default: 25 } // Default 25%
// });

// // Create User Model
// const User = mongoose.model("User", userSchema);
// module.exports = User;


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  htag: { type: Number, default: 0 }, // Total downline count
  referralPercentage: { type: Number, default: 25 }, // Default 25%
  dummy: { type: Number, default: 0 } // Dummy field for testing
});

const User = mongoose.model("User", userSchema);
module.exports = User;
