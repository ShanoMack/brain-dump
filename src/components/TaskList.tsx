import { useState } from "react";
import TaskItem from "./TaskItem";
import { GripVertical } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Tag = Database["public"]["Tables"]["tags"]["Row"];

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
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragSourceIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = () => {
    if (
      dragSourceIndex === null ||
      dragOverIndex === null ||
      dragSourceIndex === dragOverIndex
    ) {
      resetDragState();
      return;
    }

    const newTasks = [...tasks];
    const dragged = newTasks.splice(dragSourceIndex, 1)[0];

    // If dragging down, insert after dragOverIndex, else at dragOverIndex
    let insertIndex = dragOverIndex;
    if (dragSourceIndex < dragOverIndex) {
      insertIndex = dragOverIndex + 1;
    }

    // Clamp insertIndex to array bounds
    insertIndex = Math.min(insertIndex, newTasks.length);

    newTasks.splice(insertIndex, 0, dragged);

    // Update order props
    const reorderedTasks = newTasks.map((task, idx) => ({ ...task, ordinal: idx }));
    onReorderTasks(reorderedTasks);
    resetDragState();
  };

  const resetDragState = () => {
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-left text-slate-500">
        No tasks yet. Add one above!
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => a.ordinal - b.ordinal);

  return (
    <div className="relative">
      {sortedTasks.map((task, index) => {
        const isDragging = index === dragSourceIndex;
        const isDragOver = index === dragOverIndex;

        // Show divider above if dragging to an earlier position
        const showDividerAbove = dragOverIndex !== null && dragSourceIndex !== null && dragOverIndex === index && dragOverIndex < dragSourceIndex;

        // Show divider below if dragging to a later position
        // Also handle dragging after last item
        const showDividerBelow =
          dragOverIndex !== null &&
          dragSourceIndex !== null &&
          ((dragOverIndex === index && dragOverIndex > dragSourceIndex) ||
            (dragOverIndex === tasks.length && index === tasks.length - 1));

        return (
          <div key={task.id} className="relative">
            {showDividerAbove && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-400 rounded"></div>
            )}

            <div
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop();
              }}
              onDragEnd={handleDrop}
              className={`flex items-center gap-2 p-2 rounded cursor-grab select-none bg-white ${
                isDragging ? "opacity-50" : ""
              }`}
            >
              <div className="cursor-grab" aria-label="Drag handle" tabIndex={0}>
                <GripVertical className="h-5 w-5 text-slate-400" />
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

            {showDividerBelow && (
              <div className="h-[2px] bg-slate-400 rounded my-1"></div>
            )}
          </div>
        );
      })}

      {/* Handle dragging past the last item */}
      {dragOverIndex === tasks.length && dragSourceIndex !== null && (
        <div className="h-[2px] bg-slate-400 rounded my-1"></div>
      )}
    </div>
  );
};

export default TaskList;
