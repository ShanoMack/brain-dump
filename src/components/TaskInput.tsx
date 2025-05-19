
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        placeholder="Add a new task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
        <Plus className="h-5 w-5" />
        <span className="sr-only">Add task</span>
      </Button>
    </form>
  );
};

export default TaskInput;
