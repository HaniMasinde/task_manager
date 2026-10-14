
const express = require('express');

const taskController = require('../controllers/taskController');

const router = express.Router();

//create a new task

router.post('/', taskController.createTask);

//get all tasks belonging to the logged in user

router.get('/', taskController.getTasksByUser);

//get a specific task by id

router.get('/:id', taskController.getTaskById);

//update a specific task by id

router.put('/:id', taskController.updateTask);

//delete a specific task by id

router.delete('/:id', taskController.deleteTask);

//mark a specific task as completed

router.patch('/:id/complete', taskController.completedTask);

module.exports = router;