console.log("JAI SHREE RAM JI / JAI BAJARANG BALI JI");
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user.schema");

const app = express();
const port = 9080;

const MONGO_URL = "mongodb://localhost:27017/ramsir";

mongoose
  .connect(MONGO_URL, {})
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("Error in MongoDB connection:", err));

app.use(express.json()); // Middleware to parse JSON requests

// Update referral percentages
const updateReferralPercentage = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let referralsCount = user.referrals.length;

    if (referralsCount >= 10) user.referralPercentage = 35;
    else if (referralsCount >= 5) user.referralPercentage = 30;
    else user.referralPercentage = 25;

    await user.save();
  } catch (error) {
    console.error("Error updating referral percentage:", error);
  }
};

// Distribute commission
const distributeCommission = async (userId, depositAmount) => {
  try {
    let user = await User.findById(userId).populate("referredBy");
    if (!user || !user.referredBy) return;

    let currentUser = user;
    let prevPercentage = 0;

    while (currentUser.referredBy) {
      let parentUser = await User.findById(currentUser.referredBy);
      if (!parentUser) break; // Ensure parent exists

      console.log(parentUser, "parentUser");

      let commission = (depositAmount * parentUser.referralPercentage) / 100;
      console.log(commission, "commision");

      let netCommission = Math.max(
        0,
        commission - (depositAmount * prevPercentage) / 100
      ); // Ensure non-negative

      console.log(`User ${parentUser._id} gets commission: ${netCommission}`);

      // Update previous percentage
      prevPercentage = parentUser.referralPercentage;

      // Move to next parent
      currentUser = parentUser;
    }
  } catch (error) {
    console.error("Error distributing commission:", error);
  }
};

// Deposit logic
app.post("/deposit", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid deposit amount or user ID" });
    }

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.depositAmount = (user.depositAmount || 0) + amount; // Ensure depositAmount is initialized
    await user.save();

    // Distribute commission
    await distributeCommission(userId, amount);

    res.json({ message: "Deposit successful", newBalance: user.depositAmount });
  } catch (error) {
    console.error("Error in deposit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register user
app.post("/register", async (req, res) => {
  try {
    const { name, email, referredById } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    let newUser = new User({ name, email, depositAmount: 0 });

    if (referredById) {
      let referrer = await User.findById(referredById);
      if (referrer) {
        newUser.referredBy = referrer._id;
        referrer.referrals.push(newUser._id);
        await referrer.save();
        await updateReferralPercentage(referrer._id);
      }
    }

    await newUser.save();
    res.json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () => console.log(`Server running on port ${port}!`));
