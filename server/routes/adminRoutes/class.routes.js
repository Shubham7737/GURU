const express = require("express");
const router = express.Router();
const classController = require("../../controller/admin/class.controller");

router.get( "/", classController.getAllData);               //->    /api/v1/add-class

router.get( "/:id" , classController.getSingleData);

router.post("/" , classController.createData);

router.put("/:id" , classController.update);

router.delete("/:id" , classController.delete);

module.exports = router;