import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Id, Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string, columnId: Id) => void;
}

const TaskCard = ({ task, deleteTask, updateTask }: Props) => {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newContent, setNewContent] = useState(task.content);
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { type: "Task", task },
      disabled: editMode,
    });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  const handleUpdateClick = () => {
    // Call the update function when the "Update" button is clicked
    if (editMode) {
      updateTask(task.id, newContent, task.columnId);
    }
    setEditMode(false); // Exit edit mode
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-800 opacity-50 p-2.5 h-[100px]
        min-h-[100px] items-center flex flex-left rounded-xl border-2
        border-gray-600 cursor-grab relative"
      />
    );
  }

  if (editMode) {
    return (
      <div
        {...attributes}
        {...listeners}
        ref={setNodeRef}
        style={style}
        className="bg-gray-900 p-2.5 min-h-[100px] items-center flex flex-col rounded-xl
        hover:ring-2 hover:ring-inset hover:ring-blue-500
        cursor-grab relative task"
      >
        <textarea
          className="h-[90%] w-full resize-none border-none rounded
          bg-transparent text-white focus:outline-none"
          value={newContent}
          autoFocus
          placeholder="Task content here"
          onBlur={toggleEditMode}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // Prevent the default newline behavior
              handleUpdateClick(); // Call the update function
            }
          }}
        ></textarea>
        <p
          className="bg-blue-500 text-white p-2 rounded mt-2"
        >
          Press Enter to update
        </p>
      </div>
    );
  }

  return (
    <div
      onClick={toggleEditMode}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 p-2.5 h-[100px]
      min-h-[100px] items-center flex flex-left rounded-xl
      hover:ring-2 hover:ring-inset hover:ring-blue-500
      cursor-grab relative"
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto
      overflow-x-hidden whitespace-pre-wrap text-white">
        {" "}
        {task.content}
      </p>
      {mouseIsOver && (
        <button
          onClick={() => deleteTask(task.id)}
          className="stroke-white absolute right-4 top-1/2
          -translate-y-1/2 bg-gray-700 p-2 rounded"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
};

export default TaskCard;
