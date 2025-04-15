const express = require("express");
const { getBloodGroups ,getGender,getReligions,getAllRelations} = require("../controllers/miscController");

const miscRouter = express.Router();

miscRouter.post('/genders', getGender);
miscRouter.post('/blood-groups', getBloodGroups);
miscRouter.post('/religions', getReligions);
miscRouter.post('/receiver-relations', getAllRelations);


module.exports = miscRouter;
