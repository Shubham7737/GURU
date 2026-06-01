const express = require("express");
const router = express.Router();
const memberController = require("../../controller/admin/membership.controller");

router.get( "/", memberController.getAllData);               //->   /api/v1/membership

router.get( "/:id" , memberController.getSingleData);

router.post("/" , memberController.createData);

router.put("/:id" , memberController.update);

router.delete("/:id" , memberController.delete);

module.exports = router;