require("dotenv").config();

const envConfig = {
  PORT: process.env.PORT || "",
  HOST: process.env.HOST || "",
  USER: process.env.USER || "",
  PASSWORD: process.env.PASSWORD,
  DATABASE: process.env.DATABASE,
  SECRET: process.env.SECRET || "",
  BASE_URL: process.env.BASE_URL || "",
  ADMIN_URL: process.env.ADMIN_URL || "",
  ADMIN_BACKEND_URL: process.env.ADMIN_BACKEND_URL || "",
  EMAIL_HOST: process.env.EMAIL_HOST || "",
  SERVICE: process.env.SERVICE || "",
  EMAIL_PORT: process.env.EMAIL_PORT || "",
  SECURE: process.env.SECURE,
  EMAIL: process.env.EMAIL || "",
  PASS: process.env.PASS || "",
  PAYMOB_API_URL: process.env.PAYMOB_API_URL || "",
  PAYMOB_API_KEY: process.env.PAYMOB_API_KEY || "",
  PAYMOB_INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID || "",
};



module.exports = envConfig;
