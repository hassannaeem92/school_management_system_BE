const express = require("express");
const smesterRouter = express.Router();
const { createSemester, updateSemester, getAllSemesters, getSemesterById, deleteSemesters } = require("../controllers/semesterController.js");


smesterRouter.post('/createSmester', createSemester);
smesterRouter.post('/updateSmester', updateSemester);
smesterRouter.post('/getAllSemesters', getAllSemesters);
smesterRouter.post('/getSmesterById', getSemesterById);
smesterRouter.post('/deleteSemesters', deleteSemesters);

module.exports = smesterRouter;