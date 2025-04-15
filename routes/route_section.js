const express = require("express");
const { 
    assignSectionToTeacher, 
    assignStudentToSection, 
    createSection, 
    deleteStudentsFromSection, 
    getAllSection, 
    getAssignedStudents, 
    getTeacherSectionData, 
    getUnassignedStudents 
} = require("../controllers/sectionController.js");

const sectionRouter = express.Router();



sectionRouter.post('/createSection', createSection);
sectionRouter.post('/getSectionDropdown', getAllSection);
sectionRouter.post('/sectionAssign', assignSectionToTeacher);
sectionRouter.post('/studentAssign', assignStudentToSection);
sectionRouter.post('/getAllUnAssigned', getUnassignedStudents);
sectionRouter.post('/getAllAssigned', getAssignedStudents);
sectionRouter.post('/deleteStudent', deleteStudentsFromSection);
sectionRouter.post('/getSectionTeacherData', getTeacherSectionData);
// classRouter.post('/updateClass', updateClass);
// classRouter.post('/getAll', getAllClass);
// classRouter.post('/deleteClass', deleteClass);

module.exports = sectionRouter;