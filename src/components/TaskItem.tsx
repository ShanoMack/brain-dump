
import { useState } from "react";
import { Task, Tag } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Circle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface TaskItemProps {
  task: Task;
  tags: Tag[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const TaskItem = ({ task, tags, onUpdateTask, onDeleteTask }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(task.text);

  const handleEditSave = () => {
    if (editedText.trim()) {
      onUpdateTask({
        ...task,
        text: editedText.trim(),
      });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      setEditedText(task.text);
      setIsEditing(false);
    }
  };

  const handleToggleComplete = () => {
    onUpdateTask({
      ...task,
      completed: !task.completed,
    });
  };

  const handleTagChange = (tagId: string | null) => {
    onUpdateTask({
      ...task,
      tagId,
    });
  };

  const taskTag = tags.find((tag) => tag.id === task.tagId);

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-md",
        task.completed ? "bg-gray-50" : "bg-white"
      )}
      data-task-id={task.id}
    >
      <button onClick={handleToggleComplete} className="flex-shrink-0">
        {task.completed ? (
          <CheckCircle className="h-5 w-5 text-purple-600" />
        ) : (
          <Circle className="h-5 w-5 text-gray-400" />
        )}
        <span className="sr-only">
          Mark task as {task.completed ? "incomplete" : "complete"}
        </span>
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleKeyDown}
            className="h-8 py-1"
            autoFocus
          />
        ) : (
          <div
            className={cn("break-words cursor-pointer", {
              "line-through text-gray-500": task.completed,
            })}
            onClick={() => setIsEditing(true)}
          >
            {task.text}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {taskTag ? (
              <Badge
                variant="outline"
                className={cn("text-xs cursor-pointer", taskTag.color)}
              >
                {taskTag.name}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs cursor-pointer"
              >
                Add tag
              </Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleTagChange(null)}>
              Remove tag
            </DropdownMenuItem>
            {tags.map((tag) => (
              <DropdownMenuItem
                key={tag.id}
                onClick={() => handleTagChange(tag.id)}
                className={cn(
                  "flex items-center",
                  task.tagId === tag.id && "font-semibold"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    tag.color.split(" ")[0]
                  )}
                />
                {tag.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500"
          onClick={() => onDeleteTask(task.id)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete task</span>
        </Button>
      </div>
    </div>
  );
};

export default TaskItem;
