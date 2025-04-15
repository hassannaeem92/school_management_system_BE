const express = require("express");
const auth = require("./../utils/auth");
const parentPicture = require("./../middlewares/parentPicture");


const { 
    addParent,
    getAllParents,
    getParentById,
    updateParentById,
    updateParentPicture,
    // scanFingerprint 

} = require("../controllers/parentController");

const parentRouter = express.Router();

parentRouter.post('/store', auth,addParent);
parentRouter.get('/get-all', auth,getAllParents);
parentRouter.post('/get', auth,getParentById);
parentRouter.patch('/update', auth,updateParentById);
parentRouter.post("/parent-picture", auth, parentPicture.single("profile_photo"), updateParentPicture);
module.exports = parentRouter;
