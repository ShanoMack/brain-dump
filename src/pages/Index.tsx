
import { useState } from "react";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import FilterBar from "@/components/FilterBar";
import NoteSpace from "@/components/NoteSpace";
import { Task, Tag } from "@/types/task";
import { cn } from "@/lib/utils";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([
    { id: "work", name: "Work", color: "bg-blue-200 text-blue-800" },
    { id: "personal", name: "Personal", color: "bg-purple-200 text-purple-800" },
    { id: "urgent", name: "Urgent", color: "bg-red-200 text-red-800" },
  ]);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({
    work: "",
    personal: "",
    urgent: "",
  });
  
  const filteredTasks = activeTagId
    ? tasks.filter(task => task.tagId === activeTagId)
    : tasks;
  
  const handleTaskAdd = (text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      tagId: activeTagId || null,
      order: tasks.length,
    };
    setTasks([...tasks, newTask]);
  };
  
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };
  
  const handleTaskDelete = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  const handleTaskReorder = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };
  
  const handleNoteChange = (tagId: string | null, content: string) => {
    if (tagId === null) return;
    
    setNotes({
      ...notes,
      [tagId]: content,
    });
  };
  
  const renderAllNotes = () => {
    if (activeTagId !== null) return null;
    
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Notes by Tag</h2>
        <div className="space-y-6">
          {tags.map(tag => (
            <div key={tag.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className={cn("font-medium mb-2 inline-block px-2 py-1 rounded-md text-sm", tag.color)}>
                {tag.name}
              </h3>
              {notes[tag.id] ? (
                <div className="prose prose-sm max-w-none mt-2">
                  <p>{notes[tag.id]}</p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">No notes for this tag</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Task Management
        </h1>
        
        <FilterBar 
          tags={tags} 
          activeTagId={activeTagId} 
          onTagSelect={setActiveTagId}
        />
        
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <TaskInput onAddTask={handleTaskAdd} />
          
          <TaskList
            tasks={filteredTasks}
            onUpdateTask={handleTaskUpdate}
            onDeleteTask={handleTaskDelete}
            onReorderTasks={handleTaskReorder}
            tags={tags}
          />
          
          {activeTagId !== null && (
            <NoteSpace 
              note={notes[activeTagId] || ""}
              onNoteChange={(content) => handleNoteChange(activeTagId, content)}
              tagName={tags.find(tag => tag.id === activeTagId)?.name || ""}
            />
          )}
        </div>
        
        {renderAllNotes()}
      </div>
    </div>
  );
};

export default Index;
