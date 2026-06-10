const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticateToken = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } = require("../validations");

router.use(authenticateToken);

router.post("/", validate(createTaskSchema), taskController.createTask);
router.get("/", taskController.getTasks);
router.get("/:id", taskController.getTaskById);
router.put("/:id", validate(updateTaskSchema), taskController.updateTask);
router.patch("/:id/status", validate(updateTaskStatusSchema), taskController.updateTaskStatus);
router.delete("/:id", taskController.deleteTask);

module.exports = router;

