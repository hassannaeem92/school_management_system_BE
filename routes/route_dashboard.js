const express = require("express");
const dashboardRouter = express.Router();
const auth = require("./../utils/auth");
const { getAnalytics } = require("../controllers/dashboardController");


dashboardRouter.get('/getAnalytics', getAnalytics);

module.exports = dashboardRouter;