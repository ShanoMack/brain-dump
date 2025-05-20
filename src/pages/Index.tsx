import { useRef, useState, useEffect } from "react";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import FilterBar from "@/components/FilterBar";
import NoteSpace from "@/components/NoteSpace";
import TagManager, { TagManagerHandle } from "@/components/TagManager";
import { Task, Tag } from "@/types/task";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Index = () => {
  const tagManagerRef = useRef<TagManagerHandle>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showTagManager, setShowTagManager] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    const savedTags = localStorage.getItem("tags");
    const savedNotes = localStorage.getItem("notes");

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedTags) setTags(JSON.parse(savedTags));
    if (savedNotes) setNotes(JSON.parse(savedNotes));

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
    ? tasks.filter((task) => task.tagId === activeTagId)
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
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
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

  const getActiveTagName = () => {
    if (activeTagId === null) return "All tasks";
    return tags.find((tag) => tag.id === activeTagId)?.name || "";
  };

  const handleTagManagerSave = () => {
    const updatedTags = tagManagerRef.current?.getTags?.();
    if (updatedTags) {
      // Clean up references to deleted tags
      const updatedTagIds = new Set(updatedTags.map(tag => tag.id));

      const cleanedTasks = tasks.map(task =>
        updatedTagIds.has(task.tagId ?? "") ? task : { ...task, tagId: null }
      );

      const cleanedNotes: Record<string, string> = {};
      updatedTags.forEach(tag => {
        if (notes[tag.id]) {
          cleanedNotes[tag.id] = notes[tag.id];
        }
      });

      setTasks(cleanedTasks);
      setNotes(cleanedNotes);
      setTags(updatedTags);

      if (activeTagId && !updatedTagIds.has(activeTagId)) {
        setActiveTagId(null);
      }
    }

    setShowTagManager(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <h1 className="text-3xl font-bold text-slate-900 text-left">
          BrainDump
        </h1>
        <p className="text-sm text-slate-500 mb-3 text-left">
          The ultralight to-do list that works.
        </p>

        <div className="flex items-center justify-between mb-3">
          <FilterBar
            tags={tags}
            activeTagId={activeTagId}
            onTagSelect={setActiveTagId}
          />

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowTagManager(true)}
          >
            <Edit className="h-4 w-4" />
            Manage Tags
          </Button>
        </div>

        <Sheet open={showTagManager} onOpenChange={setShowTagManager}>
          <SheetContent side="right" className="max-w-md w-full bg-white">
            <SheetHeader>
              <SheetTitle>Manage Tags</SheetTitle>
              <SheetDescription>
                Make changes to your tags here. Click apply when you're done.
              </SheetDescription>
            </SheetHeader>
            
            <div>
              <TagManager
                ref={tagManagerRef}
                tags={tags}
              />
            </div>

            <SheetFooter className="justify-end gap-2 mt-8">
              <Button onClick={handleTagManagerSave}>Apply</Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[500px] border rounded-lg bg-white"
        >
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="p-6">
              <TaskInput onAddTask={handleTaskAdd} />
              <h3 className="text-lg font-medium mb-3">All tasks</h3>
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
                  onNoteChange={(content) =>
                    handleNoteChange(activeTagId, content)
                  }
                  tagName={getActiveTagName()}
                />
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">All notes</h3>

                  {/* Default Notes Section */}
                  <div className="rounded-lg">
                    <h3 className="font-medium mb-2 inline-block px-2 py-1 rounded-md text-sm bg-slate-200 text-slate-800">
                      General
                    </h3>
                    <NoteSpace
                      note={notes["default"] || ""}
                      onNoteChange={(content) => handleNoteChange("default", content)}
                      tagName=""
                    />
                  </div>

                  {/* Tagged Notes Section */}
                  {tags.map((tag) => (
                    <div key={tag.id} className="rounded-lg">
                      <h3
                        className={cn(
                          "font-medium mb-2 inline-block px-2 py-1 rounded-md text-sm",
                          tag.color
                        )}
                      >
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
