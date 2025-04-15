const express = require("express");
const subjectRouter = express.Router();
const { createSubject , updateSubject, getAllSubjects, getSubjectById, deleteSubject} = require("../controllers/subjectController.js");


subjectRouter.post('/createSubject', createSubject);
subjectRouter.post('/updateSubject', updateSubject);
subjectRouter.post('/getAllSubject', getAllSubjects);
subjectRouter.post('/getSubjectById', getSubjectById);
subjectRouter.post('/deleteSubject', deleteSubject);

module.exports = subjectRouter;