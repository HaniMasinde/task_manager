
const taskServices = require('../services/taskServices');
const asyncHandler = require('../utils/asyncHandler');

//create a new task
async function createTask(req,res,next){

  try{
    const userId = req.session.userId;

    const task = await taskServices.createTask(userId,req.body);

    return res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

//getting all task belonging to the logged in user

const getTasksByUser = async (req,res,next)=>{
  try{
    const userId = req.session.userId;

        
    const filters = {
      search: req.query.search,
      status: req.query.status,
      priority: req.query.priority,
    };

    const tasks = await taskServices.getTasksByUser(userId, filters);
    return res.status(200).json({
      status: 'success',
      //message: 'Tasks retrieved successfully',
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

//getting a specific task by id

const getTaskById = async (req,res,next)=>{
  try{
    const userId = req.session.userId;
    const taskId = Number(req.params.id);

    const task = await taskServices.getTaskById(userId,taskId);

    if(!task){
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      //message: 'Task retrieved successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

//updating a specific task by id

const updateTask = async (req,res,next)=>{
  try{
    const userId = req.session.userId;
    const taskId = Number(req.params.id);

    const updatedTask = await taskServices.updateTask(userId,taskId,req.body);

    return res.status(200).json({
      status: 'success',
      //message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

//deleting a specific task by id

const deleteTask = async (req,res,next)=>{
  try{
    const userId = req.session.userId;
    const taskId = Number(req.params.id);

    await taskServices.deleteTask(userId,taskId);

    return res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

//mark a specific task as completed

const completedTask = async (req,res,next)=>{
  try{
    const userId = req.session.userId;
    const taskId = Number(req.params.id);

    await taskServices.completedTask(userId,taskId);

    return res.status(200).json({
      status: 'success',
      message: 'Task marked as completed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasksByUser,
  getTaskById,
  updateTask,
  deleteTask,
  completedTask,
};