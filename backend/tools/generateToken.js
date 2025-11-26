import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const payload = {
  sub: "TEST_USER_ID",
  role: "Patient"
};

const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
  expiresIn: "1h" 
});

console.log("Generated Access Token:");
console.log(token);
