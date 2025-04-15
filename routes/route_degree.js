const express = require("express");
const degreeRouter = express.Router();
const { createDegree , updateDegree, getAllDegree, getDegreeById, deleteDegree} = require("../controllers/degreeController.js");


degreeRouter.post('/createDegree', createDegree);
degreeRouter.post('/updateDegree', updateDegree);
degreeRouter.post('/getAllDegree', getAllDegree);
degreeRouter.post('/getDegreeById', getDegreeById);
degreeRouter.post('/deleteDegree', deleteDegree);

module.exports = degreeRouter;