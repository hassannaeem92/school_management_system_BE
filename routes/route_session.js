const express = require("express");
const sessionRouter = express.Router();
const {
    updateSession,
    deleteSession,
    getSessionById,
    getAllSessions,
    createSession
}
 = require("../controllers/sessionControllter"); // Adjust the path if needed

// Routes for session management
sessionRouter.post("/create", createSession);
sessionRouter.get("/all", getAllSessions);
sessionRouter.post("/getById", getSessionById);
sessionRouter.delete("/delete", deleteSession);
sessionRouter.put("/update", updateSession);

module.exports = sessionRouter;