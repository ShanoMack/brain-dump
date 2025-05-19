import { forwardRef, useImperativeHandle, useState } from "react";
import { Tag } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
  { value: "bg-red-200 text-red-800", label: "Red" },
  { value: "bg-orange-200 text-orange-800", label: "Orange" },
  { value: "bg-amber-200 text-amber-800", label: "Amber" },
  { value: "bg-yellow-200 text-yellow-800", label: "Yellow" },
  { value: "bg-lime-200 text-lime-800", label: "Lime" },
  { value: "bg-green-200 text-green-800", label: "Green" },
  { value: "bg-emerald-200 text-emerald-800", label: "Emerald" },
  { value: "bg-teal-200 text-teal-800", label: "Teal" },
  { value: "bg-cyan-200 text-cyan-800", label: "Cyan" },
  { value: "bg-sky-200 text-sky-800", label: "Sky" },
  { value: "bg-blue-200 text-blue-800", label: "Blue" },
  { value: "bg-indigo-200 text-indigo-800", label: "Indigo" },
  { value: "bg-violet-200 text-violet-800", label: "Violet" },
  { value: "bg-purple-200 text-purple-800", label: "Purple" },
  { value: "bg-fuchsia-200 text-fuchsia-800", label: "Fuchsia" },
  { value: "bg-pink-200 text-pink-800", label: "Pink" },
  { value: "bg-rose-200 text-rose-800", label: "Rose" },
];

export interface TagManagerHandle {
  getTags: () => Tag[];
}

interface TagManagerProps {
  tags: Tag[];
  onSave: (tags: Tag[]) => void;
}

const TagManager = forwardRef<TagManagerHandle, { tags: Tag[] }>((props, ref) => {
  const [localTags, setLocalTags] = useState<Tag[]>(props.tags);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);

  useImperativeHandle(ref, () => ({
    getTags: () => localTags,
  }));

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

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      const tagId = newTagName.toLowerCase().replace(/\s+/g, "-");
      const newTag: Tag = {
        id: `${tagId}-${Date.now()}`,
        name: newTagName.trim(),
        color: newTagColor,
      };
      setLocalTags((prev) => [...prev, newTag]);
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0].value);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col h-full">
      {/* Editable tags list */}
      <div className="flex-grow overflow-auto space-y-4 mb-6">
        {localTags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-4">
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
              variant="outline" size="icon"
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              onClick={() => handleDeleteLocalTag(tag.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete tag</span>
            </Button>
          </div>
        ))}
      </div>

      {/* Add new tag */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="New tag name"
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
    </div>
  );
});

export default TagManager;
