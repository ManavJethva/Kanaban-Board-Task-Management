import { useState, useMemo,useEffect } from "react"
// import PlusIcon from "../icons/PlusIcon"
import { Column, Id, Task } from "../types"
import ColumnContainer from "./ColumnContainer"
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, DragOverEvent, useSensors, useSensor, PointerSensor } from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import TaskCard from "./TaskCard"
import axios from "axios"

const KanbanBoard = () => {

    const [columns, setColumns] = useState<Column[]>([])
    const [activeColumn, setActiveColumn] = useState<Column | null>(null)
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns])
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 3 }
    }))
    const baseURL="http://localhost:3001";
    // function createNewColumn () {
    //     const columnToAdd: Column = {
    //         id: generateId(),
    //         title: `Column ${columns.length + 1}`
    //     }
    //     setColumns([...columns, columnToAdd]);
    // }
    function generateId () {
        return Math.floor(Math.random() * 1000) + 1;
    }

    function deleteColumn (id: Id) {
        const filteredColumns = columns.filter((col) => col.id !== id);
        setColumns(filteredColumns)

        const newTasks = tasks.filter((t)=> t.columnId !== id);
        setTasks(newTasks)
    }
    
    function updateColumn (id: Id, title: string){
        const newColumns = columns.map((col)=>{
            if(col.id !== id) return col;
            return { ...col, title }
        });
        setColumns(newColumns)
    }
    async function createTask(columnId: Id) {
        try {
          const response = await axios.post(`${baseURL}/api/tasks`, {
            content: `Task ${tasks.length + 1}`,
            columnId,
            id: generateId()
          });
      
          // Update your state with the newly created task (response.data)
          setTasks([...tasks, response.data]);
        } catch (error) {
          // Handle error
          console.error('Failed to create task:', error);
        }
      }
      
      // Updated deleteTask function to make a DELETE request
      async function deleteTask(id: Id) {
        try {
          await axios.delete(`${baseURL}/api/tasks/${id}`);
          
          // Update your state to remove the deleted task
          const newTasks = tasks.filter((task) => task.id !== id);
          setTasks(newTasks);
        } catch (error) {
          // Handle error
          console.error('Failed to delete task:', error);
        }
      }
      
      // Updated updateTask function to make a PUT request
      async function updateTask(id: Id, content: string, columnId: Id) {
        try {
          const response = await axios.put(`${baseURL}/api/tasks/${id}`, {
            content,
            columnId,
          });
      
          // Update your state with the updated task (response.data)
          const newTasks = tasks.map((task) =>
            task.id !== id ? task : { ...task, content: response.data.content,columnId: response.data.columnId }
          );
          setTasks(newTasks);
        } catch (error) {
          // Handle error
          console.error('Failed to update task:', error);
        }
      }

    function onDragStart (event: DragStartEvent) {
        console.log("Drag Start", event)
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);        
            return;
        }
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        console.log("Drag End", event)
        setActiveColumn(null);
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;
      
        const activeTask = active.data.current?.task;
        const overColumn = active.data.current?.task.columnId;
        if (!activeTask || !overColumn) return;
        
        const taskId = activeTask.id;
        const newColumnId = overColumn;
        const content = activeTask.content;
        // Now you can update the task's columnId in your state and send the API request.
        // Example of how to update the task's columnId in your state:
        const updatedTasks = tasks.map((task) =>
          task.id === taskId ? { ...task, columnId: newColumnId } : task
        );
        setTasks(updatedTasks);
        console.log(updatedTasks)
        // Make the API request to update the task's columnId in the backend.
        updateTask(taskId,content, newColumnId);
      }
      
      
    function onDragOver (event: DragOverEvent) {
        const {active, over} = event;
        if(!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;
        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";

        if(!isActiveATask) return;

        // dropping a task over another task
        if(isActiveATask && isOverATask){
            setTasks((tasks)=>{
                const activeIndex = tasks.findIndex((t)=>t.id === activeId);
                const overIndex = tasks.findIndex((t)=> t.id === overId);
                tasks[activeIndex].columnId = tasks[overIndex].columnId
                return arrayMove(tasks, activeIndex, overIndex)
            })
        }

        const isOverAColumn = over.data.current?.type === "Column";
        //dorpping a task over another coloumn
        if (isActiveATask && isOverAColumn){
            setTasks((tasks)=>{
                const activeIndex = tasks.findIndex((t)=>t.id === activeId);
                tasks[activeIndex].columnId = overId
                return arrayMove(tasks, activeIndex, activeIndex)
            }) 
        }
    }   
    useEffect(() => {
        const initialColumns = [
            { id: "1", title: "To Do" },
            { id: "2", title: "Doing" },
            { id: "3", title: "Done" }
        ];
        setColumns(initialColumns);
        axios.get(`${baseURL}/api/tasks`)
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error('Failed to fetch tasks:', error);
      });
    }, []);
    return (
        <div
            className="m-auto flex
                min-h-screen
                w-full items-center
                overflow-x-auto
                overflow-y-hidden
                px-[40px]
        ">
            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
                <div className="m-auto flex gap-4">
                    <div className="flex gap-4">
                        <SortableContext items={columnsId}>
                            {columns.map((col) => (
                                <ColumnContainer
                                key={col.id}
                                column={col}
                                deleteColumn={deleteColumn}
                                updateColumn={updateColumn}
                                createTask={createTask}
                                tasks = {tasks.filter((task)=>task.columnId === col.id)}
                                deleteTask={deleteTask}
                                updateTask={updateTask}
                                />
                            ))}
                        </SortableContext>
                    </div>
                    
                </div>
                {createPortal(
                    <DragOverlay >
                        {activeColumn && (
                            <ColumnContainer
                            column={activeColumn}
                            deleteColumn={deleteColumn}
                            updateColumn={updateColumn}
                            createTask={createTask}
                            tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                            />
                        )}
                    {activeTask && <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask}/>}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

        </div>
    )
}

export default KanbanBoard