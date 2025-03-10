console.log("🚀 JAI SHREE RAM JI / JAI BAJARANG BALI JI 🚀");

const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/new.schema");

const app = express();
const port = 9080;

const MONGO_URL = "mongodb://localhost:27017/ramsir";

mongoose
  .connect(MONGO_URL, {})
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ Error in MongoDB connection:", err));

app.use(express.json());

// 🔥 Commission Distribution Logic (2 Levels)
const distributeCommission = async (userId, depositAmount) => {
  try {
    let currentUser = await User.findById(userId).populate("referredBy");
    if (!currentUser || !currentUser.referredBy) return;

    let remainingAmount = (depositAmount * 60) / 100; // Total amount to be distributed (max 60%)
    let prevPercentage = 0;
    let level = 0;
    let commissionLog = [];

    while (currentUser.referredBy && level < 2) {
      let parentUser = await User.findById(currentUser.referredBy);
      if (!parentUser) break;

      let parentPercentage = parentUser.referralPercentage;
      let difference = Math.max(0, parentPercentage - prevPercentage);

      if (difference > 0) {
        let commission = (remainingAmount * difference) / 100;
        commission = Math.min(commission, remainingAmount); // Ensure we don't distribute more than 60%

        // Parent को amount add करना
        parentUser.depositAmount += commission;
        await parentUser.save();

        // Log update करना
        commissionLog.push({
          parentId: parentUser._id,
          received: commission,
          remainingAfter: remainingAmount - commission,
        });

        remainingAmount -= commission;
      }

      prevPercentage = parentPercentage;
      currentUser = parentUser;
      level++;
    }

    // अगर 60% पूरा distribute नहीं हुआ, तो log करें
    if (remainingAmount > 0) {
      console.log(`🛑 Remaining Amount Not Distributed: ₹${remainingAmount}`);
    }

    // Dummy field में log store करें
    await User.findByIdAndUpdate(userId, { $set: { dummy: commissionLog } });

  } catch (error) {
    console.error("❌ Error in commission distribution:", error);
  }
};

// 🔥 Deposit API
app.post("/deposit", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: "❌ Invalid deposit amount or user ID" });
    }

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "❌ User not found" });

    user.depositAmount += amount;
    await user.save();

    // Commission Distribution Call
    await distributeCommission(userId, amount);

    res.json({ message: "✅ Deposit successful", newBalance: user.depositAmount });
  } catch (error) {
    console.error("❌ Error in deposit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Test Route
app.get("/", (req, res) => res.send("🚀 Referral System API Running! 🚀"));
app.listen(port, () => console.log(`🔥 Server running on port ${port}!`));
