const express = require("express");
const router = express.Router();
const courseController = require("../../controller/admin/course.controller");
const upload = require("../../middleware/upload");

// GET all courses
router.get("/", courseController.getAllData);

// GET single course
router.get("/:id", courseController.getSingleData);

// CREATE course with multiple file support
router.post("/", upload.any(), courseController.createData);

// UPDATE course with multiple file support
router.put("/:id", upload.any(), courseController.update);

// DELETE course
router.delete("/:id", courseController.delete);

module.exports = router;
