const express = require("express");
const auth = require("./../utils/auth");
const upload = require("./../middlewares/upload");

const { 
    createReceiver,
    updateReceiver,
    getReceiverById
} = require("../controllers/receiverController");

const receiverRouter = express.Router();

receiverRouter.post('/store',auth, createReceiver);
receiverRouter.patch('/update',auth, updateReceiver);
receiverRouter.post('/get',auth, getReceiverById);
// receiverRouter.post('/get',auth, updateReceiver);
// guardianRouter.post('/getByStudentId',auth, getGuardianByStudentId);


module.exports = receiverRouter