import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, GripVertical, HelpCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { Database } from "@/integrations/supabase/types";
type Tag = Database["public"]["Tables"]["tags"]["Row"];

const TAG_COLORS = [
  { value: "bg-red-400 text-red-900", label: "Red" },
  { value: "bg-orange-400 text-orange-900", label: "Orange" },
  { value: "bg-amber-400 text-amber-900", label: "Amber" },
  { value: "bg-yellow-400 text-yellow-900", label: "Yellow" },
  { value: "bg-lime-400 text-lime-900", label: "Lime" },
  { value: "bg-green-400 text-green-900", label: "Green" },
  { value: "bg-emerald-400 text-emerald-900", label: "Emerald" },
  { value: "bg-teal-400 text-teal-900", label: "Teal" },
  { value: "bg-cyan-400 text-cyan-900", label: "Cyan" },
  { value: "bg-sky-400 text-sky-900", label: "Sky" },
  { value: "bg-blue-400 text-blue-900", label: "Blue" },
  { value: "bg-indigo-400 text-indigo-900", label: "Indigo" },
  { value: "bg-violet-400 text-violet-900", label: "Violet" },
  { value: "bg-purple-400 text-purple-900", label: "Purple" },
  { value: "bg-fuchsia-400 text-fuchsia-900", label: "Fuchsia" },
  { value: "bg-pink-400 text-pink-900", label: "Pink" },
  { value: "bg-rose-400 text-rose-900", label: "Rose" },
];

interface TagManagerProps {
  tags: Tag[];
  onSave: (tags: Tag[]) => void;
}

export interface TagManagerHandle {
  getTags: () => Tag[];
}

const TagManager = forwardRef<TagManagerHandle, { tags: Tag[] }>((props, ref) => {

  type LocalTag = {
    id?: string;
    name: string;
    color: string;
    user_id?: string;
  };
  const [localTags, setLocalTags] = useState<LocalTag[]>(props.tags);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);

  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  useEffect(() => {
    setLocalTags(props.tags);
  }, [props.tags]);

  useImperativeHandle(ref, () => ({
    getTags: () => localTags as Tag[]
  }));

  const reorderTags = () => {
    if (
      dragSourceIndex === null ||
      dragOverIndex === null ||
      dragSourceIndex === dragOverIndex
    ) {
      resetDragState();
      return;
    }

    const newTags = [...localTags];
    const [movedTag] = newTags.splice(dragSourceIndex, 1);

    // Insert at correct position
    const insertIndex = dragSourceIndex < dragOverIndex ? dragOverIndex : dragOverIndex;
    newTags.splice(insertIndex, 0, movedTag);

    setLocalTags(newTags);
    resetDragState();
  };

  const resetDragState = () => {
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      const newTag: LocalTag = {
        name: newTagName.trim(),
        color: newTagColor,
      };
      setLocalTags((prev) => [...prev, newTag]);
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0].value);
    }
  };

  const handleChangeTagName = (id: string, name: string) => {
    setLocalTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name } : t))
    );
  };

  const handleChangeTagColor = (id: string, color: string) => {
    setLocalTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, color } : t))
    );
  };

  const handleDeleteLocalTag = (id: string) => {
    setLocalTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="w-full max-w-md">      
      {/* Add new tag */}
      <div className="flex-grow">
        <TooltipProvider>
        <div className="flex items-center gap-1 text-sm font-medium mb-1">
          Add a new tag
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-sm">
            Type in a name and click the plus to add it to your tags
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
        <div className="flex gap-2"> 
          <Input
            placeholder="Enter tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="w-40"
            maxLength={20}
          />
          <Select value={newTagColor} onValueChange={setNewTagColor}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Color" />
            </SelectTrigger>
            <SelectContent>
              {TAG_COLORS.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("w-3 h-3 rounded-full", color.value.split(" ")[0])}
                    ></span>
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleAddNewTag}>
            <Plus/>
          </Button>
        </div>
        <div className="border-t mt-6"></div>        
      </div>

      {/* Editable + reorderable tag list */}
      <div className="flex-grow relative">
        {localTags.length > 0 && (
          <p className="text-sm font-medium mt-6 mb-1">Your tags</p>
        )}
        {localTags.map((tag, index) => {
          const isDragging = index === dragSourceIndex;
          const isDragOver = index === dragOverIndex;

          // Show divider above if dragging to an earlier position
          const showDividerAbove = 
            dragOverIndex !== null && 
            dragSourceIndex !== null && 
            dragOverIndex === index && 
            dragOverIndex < dragSourceIndex;

          // Show divider below if dragging to a later position
          const showDividerBelow =
            dragOverIndex !== null &&
            dragSourceIndex !== null &&
            ((dragOverIndex === index && dragOverIndex > dragSourceIndex) ||
              (dragOverIndex === localTags.length && index === localTags.length - 1));

          return (
            <div key={tag.id || index} className="relative">
              {showDividerAbove && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-400 rounded"></div>
              )}

              {/* Main container needs dragOver and drop handlers */}
              <div 
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverIndex !== index) {
                    setDragOverIndex(index);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  reorderTags();
                }}
                className="flex gap-2 mb-1 items-center rounded p-1"
              >
                {/* Drag handle only needs dragStart and dragEnd */}
                <div
                  draggable
                  onDragStart={() => setDragSourceIndex(index)}
                  onDragEnd={reorderTags}
                  className="cursor-grab"
                >
                  <GripVertical className="h-5 w-5 text-slate-400" />
                </div>

                {/* Content container remains the same */}
                <div 
                  className={cn(
                    "flex flex-1 gap-2 items-center",
                    dragSourceIndex === index ? "opacity-50" : ""
                  )}
                >
                  <Input
                    className="w-40"
                    value={tag.name}
                    onChange={(e) => handleChangeTagName(tag.id, e.target.value)}
                  />

                  <Select
                    value={tag.color}
                    onValueChange={(color) => handleChangeTagColor(tag.id, color)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAG_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn("w-3 h-3 rounded-full", color.value.split(" ")[0])}
                            ></span>
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-red-100 hover:text-red-600"
                    onClick={() => handleDeleteLocalTag(tag.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete tag</span>
                  </Button>
                </div>
              </div>

              {showDividerBelow && (
                <div className="h-[2px] bg-slate-400 rounded my-1"></div>
              )}
            </div>
          );
        })}

        {/* Handle dragging past the last item */}
        {dragOverIndex === localTags.length && dragSourceIndex !== null && (
          <div className="h-[2px] bg-slate-400 rounded my-1"></div>
        )}
      </div>
    </div>
  );
});

export default TagManager;
