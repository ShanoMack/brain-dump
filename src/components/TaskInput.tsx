
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface TaskInputProps {
  onAddTask: (text: string) => void;
}

const TaskInput = ({ onAddTask }: TaskInputProps) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTask(text.trim());
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-grow gap-2 mb-6">
      <TooltipProvider>
        <div className="flex items-center gap-1 text-sm font-medium mb-1">
          Add a new task
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs text-sm">
              Type in a name and press enter or click the plus to add it to your list
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      <div className="flex gap-2 mb-1">
      <Input
        placeholder="Enter a task name..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1"
      />
      <Button variant="outline" size="icon">
        <Plus className="h-5 w-5" />
      </Button>
      </div>
      <div className="border-t mt-4"></div>  
    </form>
  );
};

export default TaskInput;
