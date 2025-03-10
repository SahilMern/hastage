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

app.use(express.json()); // Middleware to parse JSON requests

// 🔥 Referral Percentage Update Logic
const updateReferralPercentage = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let referralsCount = user.htag;
    console.log(referralsCount, "refferalCount");
    
    if (referralsCount >= 12000) user.referralPercentage = 60;
    else if (referralsCount >= 8000) user.referralPercentage = 57;
    else if (referralsCount >= 4000) user.referralPercentage = 55;
    else if (referralsCount >= 2000) user.referralPercentage = 52.5;
    else if (referralsCount >= 1000) user.referralPercentage = 50;
    else if (referralsCount >= 625) user.referralPercentage = 45;
    else if (referralsCount >= 125) user.referralPercentage = 40;
    else if (referralsCount >= 10) user.referralPercentage = 35;
    else user.referralPercentage = 25;

    await user.save();
  } catch (error) {
    console.error("❌ Error updating referral percentage:", error);
  }
};

// 🔥 Register First Main User (if not exists)
const createMainUser = async () => {
  const mainUser = await User.findOne({ email: "admin@example.com" });
  if (!mainUser) {
    const newUser = new User({ 
      name: "Admin", 
      email: "admin@example.com",
      referralPercentage: 25 
    });
    await newUser.save();
    console.log("✅ Main Admin User Created:", newUser);
  }
};
createMainUser();

// 🔥 Register User API & Update htag for 10 Levels
app.post("/register", async (req, res) => {
  try {
    const { name, email, referredById } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "❌ Name and email are required" });
    }

    let newUser = new User({ name, email });

    if (referredById) {
      let referrer = await User.findById(referredById);
      if (referrer) {
        newUser.referredBy = referrer._id;
        referrer.referrals.push(newUser._id);
        await referrer.save();

        let currentReferrer = referrer;
        let level = 0;

        while (currentReferrer && level < 10) {
          currentReferrer.htag += 1;
          await updateReferralPercentage(currentReferrer._id);
          await currentReferrer.save();

          if (currentReferrer.referredBy) {
            currentReferrer = await User.findById(currentReferrer.referredBy);
          } else {
            break;
          }
          level++;
        }
      }
    }

    await newUser.save();
    res.json({ message: "✅ User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error("❌ Error in registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



app.get("/", (req, res) => res.send("🚀 Referral System API Running! 🚀"));
app.listen(port, () => console.log(`🔥 Server running on port ${port}!`));
