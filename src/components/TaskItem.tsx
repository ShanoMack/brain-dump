import { useState } from "react";
import { Task, Tag } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Circle, CircleCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

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
    const trimmed = editedText.trim();
    if (trimmed) {
      onUpdateTask({ ...task, text: trimmed });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleEditSave();
    else if (e.key === "Escape") {
      setEditedText(task.text);
      setIsEditing(false);
    }
  };

  const handleToggleComplete = () => {
    onUpdateTask({ ...task, completed: !task.completed });
  };

  const handleTagChange = (tagId: string | null) => {
    onUpdateTask({ ...task, tagId });
  };

  const taskTag = tags.find((tag) => tag.id === task.tagId);

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2",
        task.completed ? "bg-slate-50" : "bg-white"
      )}
      data-task-id={task.id}
    >
      <button onClick={handleToggleComplete} className="flex-shrink-0">
        {task.completed ? (
          <CircleCheck className="h-5 w-5 text-slate-600" />
        ) : (
          <Circle className="h-5 w-5 text-slate-400" />
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
            className="h-[32px] py-1"
            autoFocus
          />
        ) : (
          <div
            className={cn("break-words cursor-pointer", {
              "line-through text-slate-500": task.completed,
            })}
            onClick={() => setIsEditing(true)}
          >
            {task.text}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <Select
          value={task.tagId ?? "__none__"}
          onValueChange={(val) => handleTagChange(val === "__none__" ? null : val)}
        >
          <SelectTrigger
            className={cn(
              "w-auto h-[32px] px-4 text-sm rounded-full border [&>svg]:hidden",
              taskTag?.color ?? "border-slate-300 text-slate-800 hover:bg-slate-200",
              "bg-opacity-10 border-slate-300 text-opacity-70 hover:bg-opacity-30"
            )}
          >
            <SelectValue placeholder="Add tag" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="__none__">Untagged</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                <span className="inline-flex items-center gap-2">
                  {tag.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          className="hover:bg-red-50 hover:text-red-500"
          onClick={() => onDeleteTask(task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>  
  );
};

export default TaskItem;
