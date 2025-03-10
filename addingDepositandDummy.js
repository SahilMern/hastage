const mongoose = require("mongoose");
const User = require("./models/new.schema"); // Ensure correct path

const MONGO_URL = "mongodb://localhost:27017/ramsir";

mongoose
  .connect(MONGO_URL, {})
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

    // 🔥 Update all users to add missing fields
    const updateFields = {
      $set: {
        depositAmount: 0, // If missing, set default depositAmount
        dummy: [] // If missing, set default empty array
      }
    };

    try {
      const result = await User.updateMany({}, updateFields);
      console.log(`✅ Updated ${result.modifiedCount} users with new fields.`);
    } catch (error) {
      console.error("❌ Error updating users:", error);
    }

    // Close the connection after update
    mongoose.connection.close();
  })
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));
