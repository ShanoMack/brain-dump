
import { useState, useEffect } from "react";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import FilterBar from "@/components/FilterBar";
import NoteSpace from "@/components/NoteSpace";
import TagManager from "@/components/TagManager";
import { Task, Tag } from "@/types/task";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showTagManager, setShowTagManager] = useState(false);
  
  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    const savedTags = localStorage.getItem("tags");
    const savedNotes = localStorage.getItem("notes");
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedTags) setTags(JSON.parse(savedTags));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    
    // If no tags exist, create default ones
    if (!savedTags) {
      const defaultTags = [
        { id: "work", name: "Work", color: "bg-blue-200 text-blue-800" },
        { id: "personal", name: "Personal", color: "bg-purple-200 text-purple-800" },
        { id: "urgent", name: "Urgent", color: "bg-red-200 text-red-800" },
      ];
      setTags(defaultTags);
      localStorage.setItem("tags", JSON.stringify(defaultTags));
    }
  }, []);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem("tags", JSON.stringify(tags));
  }, [tags]);
  
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);
  
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
  
  const handleTagAdd = (newTag: Tag) => {
    setTags([...tags, newTag]);
  };
  
  const handleTagUpdate = (updatedTag: Tag) => {
    setTags(tags.map(tag => 
      tag.id === updatedTag.id ? updatedTag : tag
    ));
  };
  
  const handleTagDelete = (tagId: string) => {
    // Remove the tag from tasks
    const updatedTasks = tasks.map(task => 
      task.tagId === tagId ? { ...task, tagId: null } : task
    );
    setTasks(updatedTasks);
    
    // Remove the tag's notes
    const { [tagId]: _, ...remainingNotes } = notes;
    setNotes(remainingNotes);
    
    // Remove the tag
    setTags(tags.filter(tag => tag.id !== tagId));
    
    // Update activeTagId if it was the deleted tag
    if (activeTagId === tagId) {
      setActiveTagId(null);
    }
  };
  
  const getActiveTagName = () => {
    if (activeTagId === null) return "All Tasks";
    return tags.find(tag => tag.id === activeTagId)?.name || "";
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Task Management
        </h1>
        
        <div className="flex items-center justify-between mb-4">
          <FilterBar 
            tags={tags} 
            activeTagId={activeTagId} 
            onTagSelect={setActiveTagId}
          />
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowTagManager(!showTagManager)}
          >
            <Edit className="h-4 w-4" />
            Manage Tags
          </Button>
        </div>
        
        {showTagManager && (
          <div className="mb-6">
            <TagManager 
              tags={tags}
              onAddTag={handleTagAdd}
              onUpdateTag={handleTagUpdate}
              onDeleteTag={handleTagDelete}
            />
          </div>
        )}
        
        <ResizablePanelGroup direction="horizontal" className="min-h-[500px] border rounded-lg bg-white">
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="p-6">
              <TaskInput onAddTask={handleTaskAdd} />
              
              <TaskList
                tasks={filteredTasks}
                onUpdateTask={handleTaskUpdate}
                onDeleteTask={handleTaskDelete}
                onReorderTasks={handleTaskReorder}
                tags={tags}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="p-6 border-l h-full">
              {activeTagId !== null ? (
                <NoteSpace 
                  note={notes[activeTagId] || ""}
                  onNoteChange={(content) => handleNoteChange(activeTagId, content)}
                  tagName={getActiveTagName()}
                />
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium mb-3">Notes by Tag</h3>
                  {tags.map(tag => (
                    <div key={tag.id} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className={cn("font-medium mb-2 inline-block px-2 py-1 rounded-md text-sm", tag.color)}>
                        {tag.name}
                      </h3>
                      <NoteSpace 
                        note={notes[tag.id] || ""}
                        onNoteChange={(content) => handleNoteChange(tag.id, content)}
                        tagName=""
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
