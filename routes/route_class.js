const express = require("express");
const classRouter = express.Router();
const { createClass, deleteClass, getAllClass, getClassById, updateClass } = require("../controllers/classesController.js");


classRouter.post('/createClass', createClass);
classRouter.post('/updateClass', updateClass);
classRouter.post('/getAll', getAllClass);
classRouter.post('/getById', getClassById);
classRouter.post('/deleteClass', deleteClass);

module.exports = classRouter;