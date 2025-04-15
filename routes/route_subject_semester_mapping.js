const express = require("express");
const subjectSemesterRouter = express.Router();
const { createSubjectMapping , updateSubjectMapping, getAllSubjectMappings, getSubjectMappingById, deleteSubjectMappings} = require("../controllers/subjectSemesterMappingContorller");


subjectSemesterRouter.post('/createSubjectMapping', createSubjectMapping);
subjectSemesterRouter.post('/updateSubjectMapping', updateSubjectMapping);
subjectSemesterRouter.post('/getAllSubjectMappings', getAllSubjectMappings);
subjectSemesterRouter.post('/getSubjectMappingById', getSubjectMappingById);
subjectSemesterRouter.post('/deleteSubjectMappings', deleteSubjectMappings);

module.exports = subjectSemesterRouter;