import mongoose from "mongoose";
import User from "../models/User.js";
import "dotenv/config.js";

async function deleteUser() {
  const email = process.argv[2];
  if (!email) {
    console.log("❌ Please provide an email. Example: node deleteUser.js admin@mediflow.com");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const res = await User.deleteOne({ email });

  if (res.deletedCount > 0) {
    console.log(`✅ User '${email}' deleted successfully.`);
  } else {
    console.log(`⚠️ No user found with email '${email}'.`);
  }

  process.exit(0);
}

deleteUser();
