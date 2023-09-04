import express from "express"
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import Task from "./Task.js";
const app=express();
dotenv.config();
app.use(express.urlencoded({ extended: true}));
const connect=async()=>{
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGO);
        console.log("Connected to mongoDb");
      } catch (error) {
        throw error;
      }
    };

mongoose.connection.on("disconnected",()=>{
    console.log("mongoDB disconnected");
});

app.use(cors(),( err,req,res,next)=>{
 
    const errorStatus=err.status||500
    const errorMessage=err.message||("Something Went Wrong")
    return res.status(errorStatus).json({
      success: false,
      status: errorStatus,
      Message: errorMessage,
      stack: err.stack
    })
  })
  app.use(express.json())
  app.use(express.urlencoded({extended:true}))
  // Create a Task in a Specific Column
app.post('/api/tasks', async (req, res) => {
  try {
    const { id, content, columnId } = req.body; // Include the 'id' field
    const task = new Task({ id, content, columnId }); // Include 'id' in the task
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create task' });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find(); // Retrieve all tasks
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
})

// Get All Tasks in a Specific Column
app.get('/api/columns/:columnId/tasks', async (req, res) => {
  const columnId = req.params.columnId;
  try {
    const tasks = await Task.find({ columnId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// Get Task by ID
app.get('/api/tasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId;
  try {
    const task = await Task.findOne({ id: taskId }); // Use 'id' to find the task
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve task' });
  }
});

// Update Task (including Column Movement)
app.put('/api/tasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId;
  const { content, columnId } = req.body;
  try {
    const task = await Task.findOne({ id: taskId }); // Use 'id' to find the task
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.content = content;

    if (columnId !== undefined) {
      task.columnId = columnId;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete Task
app.delete('/api/tasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId;
  try {
    const deletedTask = await Task.findOneAndDelete({ id: taskId }); // Use 'id' to find and delete the task
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send(); // No content response
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});
  
  app.listen(3001,(req,res)=>{
    connect()
    console.log("Server started on port 3001!")
});