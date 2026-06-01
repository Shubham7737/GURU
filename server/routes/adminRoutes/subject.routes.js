const express = require("express");
const router = express.Router();
const subjectController = require("../../controller/admin/subject.controller");

router.get("/", subjectController.getAllData);        // GET ALL
router.get("/:id", subjectController.getSingleData);  // GET SINGLE
router.post("/", subjectController.createData);       // CREATE
router.put("/:id", subjectController.update);         // UPDATE
router.delete("/:id", subjectController.delete);      // DELETE

module.exports = router;