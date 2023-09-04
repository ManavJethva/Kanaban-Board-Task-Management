import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  id: String,
  content: String, // Task description
  columnId: String, // Identifier for the column to which the task belongs
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
