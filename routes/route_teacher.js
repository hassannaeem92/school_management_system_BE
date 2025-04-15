const express = require("express");
const auth = require("./../utils/auth");
const upload = require("./../middlewares/upload");

const { 
    getAllTeachersDropdown,
    getAllTeachers,
    createTeacher,
    getTeacher,
    updateTeacher,
    updatePicture,
    updateDocument,
    getTeacherDocument

} = require("../controllers/teacherController.js");

const teacherRouter = express.Router();


teacherRouter.post('/getTeacherDropdown',auth, getAllTeachersDropdown);
teacherRouter.post('/get-all',auth, getAllTeachers);
teacherRouter.post('/store',auth, createTeacher);
teacherRouter.post('/get',auth, getTeacher);
teacherRouter.patch('/update',auth, updateTeacher);
teacherRouter.post('/update-profile-photo', auth, upload.single("profile_photo"),updatePicture);
teacherRouter.post('/document/store', auth, upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'cnic', maxCount: 1 },
    { name: 'matriculation', maxCount: 1 },
    { name: 'inter_or_higher', maxCount: 1 },
    { name: 'agreement', maxCount: 1 },
    { name: 'experience_letter', maxCount: 1 },
    // { name: 'documents', maxCount: 1 }
  ]),updateDocument);
  teacherRouter.post('/document/get',auth,getTeacherDocument);
module.exports = teacherRouter;