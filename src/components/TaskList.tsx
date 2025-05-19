
import { useState, useRef, useEffect } from "react";
import { Task, Tag } from "@/types/task";
import TaskItem from "./TaskItem";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskListProps {
  tasks: Task[];
  tags: Tag[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
}

const TaskList = ({
  tasks,
  tags,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
}: TaskListProps) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleMoveTask = (taskId: string, direction: "up" | "down") => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (
      (direction === "up" && taskIndex === 0) ||
      (direction === "down" && taskIndex === tasks.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? taskIndex - 1 : taskIndex + 1;
    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(taskIndex, 1);
    newTasks.splice(newIndex, 0, movedTask);

    // Update order property
    const reorderedTasks = newTasks.map((task, idx) => ({
      ...task,
      order: idx,
    }));

    onReorderTasks(reorderedTasks);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks yet. Add one above!
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      {sortedTasks.map((task) => (
        <div key={task.id} className="flex items-center gap-2">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleMoveTask(task.id, "up")}
              disabled={task.order === 0}
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Move task up</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleMoveTask(task.id, "down")}
              disabled={task.order === tasks.length - 1}
            >
              <ArrowDown className="h-4 w-4" />
              <span className="sr-only">Move task down</span>
            </Button>
          </div>
          <div className="flex-1">
            <TaskItem
              task={task}
              tags={tags}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
