import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, Id, Task } from "../types";
import { useSortable, SortableContext } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  tasks: Task[];
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string, columnId: Id) => void;
}

const ColumnContainer = (props: Props) => {
  const [editMode, setEditMode] = useState(false);
  const { column, updateColumn, createTask, tasks, deleteTask, updateTask } =
    props;
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id: column.id,
      data: { type: "Column", column },
      disabled: editMode,
    });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-800 opacity-50 w-[350px] h-[500px]
        border-2 border-gray-600
        max-h-[500px] rounded-md
        flex flex-col"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-900 w-[350px] h-[500px]
      max-h-[500px] rounded-md
      flex flex-col"
    >
      {/* Column Title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
        }}
        className="bg-gray-800 text-white
                text-xl font-bold
                h-[60px] p-3    
                cursor-grab
                rounded-t-md
                border-2 border-gray-700
                flex items-center justify-between"
      >
        <div className="flex gap-2">
          <div
            className="flex
                        justify-center items-center
                        bg-gray-700
                        px-2.5 py-1 text-sm rounded-full"
          >
            1
          </div>
          {!editMode && (
            <div className="text-lg font-semibold">{column.title}</div>
          )}
          {editMode && (
            <input
              autoFocus
              className="bg-gray-800 text-white focus:border-blue-500 border rounded outline-none px-2"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setEditMode(false);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Column Task Container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>

      {/* Column Footer */}
      <button
        onClick={() => {
          createTask(column.id);
        }}
        className="flex gap-2 items-center
                bg-blue-500 text-white border-2 border-blue-700 rounded-md p-2
                border-x-blue-700
                hover:bg-blue-600 hover:text-blue-100
                active:bg-blue-800"
      >
        <PlusIcon />
        Add Task
      </button>
    </div>
  );
};

export default ColumnContainer;
