const express = require("express");
const auth = require("./../utils/auth");
const company_logo = require("../middlewares/company_logo");

const { 
    createOrUpdateInstitute, 
    getAllInstitutes
} = require("../controllers/instituteController");

const instituteRouter = express.Router();


// instituteRouter.post('/save', auth, upload.single("company_logo"), createInstitute);
instituteRouter.post('/save', auth, company_logo.single("company_logo"), createOrUpdateInstitute);
instituteRouter.post('/getAll',auth, getAllInstitutes);
instituteRouter.post('/getCompanyInfo', getAllInstitutes);

module.exports = instituteRouter