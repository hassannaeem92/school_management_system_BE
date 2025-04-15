const jwt = require("jsonwebtoken");
const env = require("./../global");
const dotenv = require("dotenv");
dotenv.config();
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // If Authorization header is not present or doesn't start with "Bearer "
    console.log("something happened bad!")
    return res.status(402).json({message:"something wrong"});
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({});
  }
};
