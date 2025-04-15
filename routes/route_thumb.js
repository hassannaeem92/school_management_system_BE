const express = require("express");
const thumbRouter = express.Router();
const auth = require("./../utils/auth");
const upload = require("../middlewares/upload"); // Middleware for handling file uploads
const {addOrUpdateStudentThumb,getStudentThumbById,updateStudentThumbById} = require("../controllers/thumbController");

// ✅ Create or Update Student Thumb
thumbRouter.post("/create",auth, upload.single("impression_picture"), addOrUpdateStudentThumb);

// ✅ Get Student Thumb by Student ID (POST instead of GET)
thumbRouter.post("/student-thumb-by-id", getStudentThumbById);


module.exports = thumbRouter;
