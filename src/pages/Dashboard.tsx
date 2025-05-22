import { useRef, useState, useEffect } from "react";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import FilterBar from "@/components/FilterBar";
import NoteSpace from "@/components/NoteSpace";
import TagManager, { TagManagerHandle } from "@/components/TagManager";
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
import DashboardHeader from "@/components/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Tag = Database["public"]["Tables"]["tags"]["Row"];

const Dashboard = () => {
  const { user } = useAuth();
  const tagManagerRef = useRef<TagManagerHandle>(null);

  //===================================TASKS========================================
  // #region Tasks
  //================================================================================

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);  

  const getActiveTagName = () => {
    if (activeTagId === null) return "All tasks";
    return tags.find((tag) => tag.id === activeTagId)?.name || "";
  };
  
  const filteredTasks = activeTagId
    ? tasks.filter((task) => task.tag_id === activeTagId)
    : tasks;

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading tasks:", error);
        return;
      }
      setTasks(data || []);
    };

    fetchTasks();
  }, [user]);

  const saveTasksToSupabase = async (tasksToSave: Task[]) => {
    if (!user) return;
    const tasksArr = tasksToSave.map(task => ({
      ...task,
      user_id: user.id,
    }));
    const { error } = await supabase
      .from("tasks")
      .upsert(tasksArr, { onConflict: "id" });
    if (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const handleTaskAdd = async (text: string) => {
    if (!user) return;
    const newTask = {
      text,
      completed: false,
      tag_id: activeTagId || null,
      ordinal: tasks.length,
      user_id: user.id,
    };
    // Insert the new task and get the inserted row (with id)
    const { data, error } = await supabase
      .from("tasks")
      .insert([newTask])
      .select(); // .select() returns the inserted row(s)
    if (error) {
      console.error("Error adding task:", error);
      return;
    }
    if (data && data.length > 0) {
      setTasks([...tasks, data[0]]);
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    const updatedTasks = tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task));
    setTasks(updatedTasks);
    await saveTasksToSupabase(updatedTasks);
  };

  const handleTaskDelete = async (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id);
  };

  const handleTaskReorder = async (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
    await saveTasksToSupabase(reorderedTasks);
  };
  //================================================================================

  //===================================TAGS=========================================
  // #region Tags
  //================================================================================
  const [tags, setTags] = useState<Tag[]>([]);  

  useEffect(() => {
    if (!user) return;

    const fetchTags = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading tags:", error);
        return;
      }
      setTags(data || []);
    };

    fetchTags();
  }, [user]);

  const saveTagsToSupabase = async (tagsToSave: Tag[]) => {
    if (!user) return;
    
    // Log incoming tags for debugging
    console.log("Tags to save:", tagsToSave);
    
    const tagsToUpsert = tagsToSave.map(tag => {
      // If it's a new tag (no id), only include required fields
      if (!tag.id) {
        return {
          name: tag.name,
          color: tag.color,
          user_id: user.id,
        };
      }
      
      // For existing tags, include all fields
      return {
        ...tag,
        user_id: user.id,
      };
    });

    console.log("Upserting tags:", tagsToUpsert);

    const { data, error } = await supabase
      .from("tags")
      .upsert(tagsToUpsert)
      .select();

    if (error) {
      console.error("Error saving tags:", error);
      return;
    }

    if (data) {
      console.log("Received tags after upsert:", data);
      setTags(data);
    }
  };  

  const handleTagManagerSave = async () => {
    const updatedTags = tagManagerRef.current?.getTags?.();
    if (updatedTags) 
    {
      // Clean up references to deleted tags
      const updatedTagIds = new Set(updatedTags.map(tag => tag.id));

      const cleanedTasks = tasks.map(task =>
        updatedTagIds.has(task.tag_id ?? "") ? task : { ...task, tagId: null }
      );

      const cleanedNotes: NoteMap = {};
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
      console.log("Saving tags to Supabase:", updatedTags);
      // Save to Supabase
      await saveTagsToSupabase(updatedTags);
    }

    setShowTagManager(false);
  };
  // #endregion
  //================================================================================

  //===================================NOTES========================================
  // #region Notes
  //================================================================================
  type NoteMap = Record<string, { id: string; content: string }>;
  const [notes, setNotes] = useState<NoteMap>({});

  const [showTagManager, setShowTagManager] = useState(false);
  
  useEffect(() => {
    if (!user) return;

    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading notes:", error);
        return;
      }
      // Convert array of notes to { [tagId]: content }
      const notesObj: NoteMap = {};
      (data || []).forEach((note: any) => {
        notesObj[note.tag_id] = { id: note.id, content: note.content };
      });
      setNotes(notesObj);
    };

    fetchNotes();
  }, [user]);

  const saveNotesToSupabase = async (tag_id: string, content: string) => {
    if (!user) return;
    const prevNote = notes[tag_id];

    // Create note object based on whether it's new or existing
    const noteData: Database["public"]["Tables"]["notes"]["Row"] = {
      id: prevNote?.id ?? crypto.randomUUID(),
      tag_id,
      content,
      user_id: user.id,
    };

    const { error } = await supabase
      .from("notes")
      .upsert(noteData);
      
    if (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleNoteChange = async (tag_id: string | null, content: string) => {
    if (tag_id === null) return;
    const prevNote = notes[tag_id];
    const updatedNotes = {
      ...notes,
      [tag_id]: { id: prevNote?.id, content },
    };
    setNotes(updatedNotes);
    await saveNotesToSupabase(tag_id, content);
  };
  // #endregion
  //================================================================================

  //================================================================================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 max-w-7xl mx-auto px-6 py-4 w-full">
        <DashboardHeader
          tags={tags}
          activeTagId={activeTagId}
          onTagSelect={setActiveTagId}
          setShowTagManager={setShowTagManager}
        />

        <Sheet open={showTagManager} onOpenChange={setShowTagManager}>
          <SheetContent side="right" className="max-w-lg bg-white flex flex-col h-full gap-6">
            <SheetHeader>
              <SheetTitle>Manage tags</SheetTitle>
              <SheetDescription>
                Make changes to your tags here. Click apply when you're done.
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto pl-1 border-t border-b py-4">
              <TagManager
                ref={tagManagerRef}
                tags={tags}
              />
            </div>
            <SheetFooter className="justify-end gap-2 mt-2">
              <Button onClick={handleTagManagerSave}>Apply</Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[500px] border rounded-lg bg-white mt-[72px]"
        >
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="p-6">
              <TaskInput onAddTask={handleTaskAdd} />
              {activeTagId !== null ? (
                <h3 className="text-lg font-medium mb-2">Tasks for {getActiveTagName()}</h3>
              ) : (
                <h3 className="text-lg font-medium mb-2">All tasks</h3>
              )}
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
                  note={notes[activeTagId]?.content || ""}
                  onNoteChange={(content) =>
                    handleNoteChange(activeTagId, content)
                  }
                  tagName={getActiveTagName()}
                />
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">All notes</h3>

                  {/* Tagged Notes Section */}
                  {tags.map((tag) => (
                    <div key={tag.id} className="rounded-lg">
                      <h3
                        className={cn(
                          "font-medium mb-2 inline-block px-2 py-1 rounded-md text-sm",
                          tag.color, "bg-opacity-20 text-opacity-80" 
                        )}
                      >
                        {tag.name}
                      </h3>
                      <NoteSpace
                        note={notes[tag.id]?.content || ""}
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
      <footer className="text-xs text-slate-400 text-center py-4">
        BrainDump v0.1a - Shane Turner © 2025
      </footer>
    </div>
  );
};

export default Dashboard;
