const express = require("express");
const auth = require("./../utils/auth");
const upload = require("./../middlewares/upload");

const { 
    addOrUpdateGuardian,
    getGuardianByStudentId,
    getAllGuardians,
    deleteGuardianByStudentId
    
} = require("../controllers/GuardianController");

const guardianRouter = express.Router();

guardianRouter.post('/save',auth, addOrUpdateGuardian);
guardianRouter.patch('/update',auth, addOrUpdateGuardian);
guardianRouter.post('/get',auth, getGuardianByStudentId);
// guardianRouter.post('/getByStudentId',auth, getGuardianByStudentId);


module.exports = guardianRouter