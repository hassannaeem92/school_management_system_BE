const express = require("express");
const auth = require("./../utils/auth");
const upload = require("./../middlewares/upload");
const { 
    createStudentFee, 
    getAllStudentDropdown, 
    getAmountById, 
    getAllStudent,
    getStudent,
    addStudent,
    updateStudent,
    updateProfilePhoto,
    updateDocument,
    getStudentDocument
} = require("../controllers/studentController.js");

const studentRouter = express.Router();




studentRouter.post('/createStudentFee',auth, createStudentFee);
studentRouter.post('/getAmountById',auth, getAmountById);
studentRouter.post('/getStudentDropdown',auth, getAllStudentDropdown);
studentRouter.post('/get-all',auth,getAllStudent);
studentRouter.post('/get',auth,getStudent);
studentRouter.post('/store',auth,addStudent);
studentRouter.patch('/update',auth,updateStudent);
studentRouter.post('/document/store',auth,  upload.fields([
    { name: 'birth_certificate', maxCount: 1 },
    { name: 'previous_school_result_card', maxCount: 1 },
    { name: 'character_certificate', maxCount: 1 },
    { name: 'b_form', maxCount: 1 },
    // { name: 'documents', maxCount: 1 }
  ]),updateDocument);
studentRouter.post('/document/get',auth,getStudentDocument);
// studentRouter.post('/update-profile-photo',auth,upload.array('files', 20),updateProfilePhoto)
// studentRouter.post('/update-profile-photo', auth, uploadSingle('profile_photo'), updateProfilePhoto);
// studentRouter.post("/update-profile-photo", auth, upload.single("profile_photo"), updateProfilePhoto);
studentRouter.post("/update-profile-photo", auth, upload.single("profile_photo"), updateProfilePhoto);
module.exports = studentRouter;
