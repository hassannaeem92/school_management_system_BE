const express = require("express");
const { 
    createFeeInstallments, 
    deleteTransaction, 
    getById, 
    getPendingAmount, 
    getStudentFeeDetail, 
    getStudentsWithFees, 
    updateFeeInstallments 
} = require("../controllers/feeController.js");

const feeRouter = express.Router();


feeRouter.post('/createFee', createFeeInstallments);
feeRouter.post('/updateFee', updateFeeInstallments);
feeRouter.post('/getFeeDetail', getStudentFeeDetail);
feeRouter.post('/getStudentsWithFees', getStudentsWithFees);
feeRouter.post('/getPendingAmount', getPendingAmount);
feeRouter.post('/getById', getById);
feeRouter.post('/deleteTransaction', deleteTransaction);
 
// feeRouter.post('/updateFee', updateFee);
// feeRouter.post('/getAll', getAllFee);
// feeRouter.post('/getById', getFeeById);
// feeRouter.post('/deleteFee', deleteFee);

module.exports = feeRouter