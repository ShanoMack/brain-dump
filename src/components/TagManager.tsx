
import { useState } from "react";
import { Tag } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface TagManagerProps {
  tags: Tag[];
  onAddTag: (tag: Tag) => void;
  onUpdateTag: (tag: Tag) => void;
  onDeleteTag: (id: string) => void;
}

const TAG_COLORS = [
  { value: "bg-blue-200 text-blue-800", label: "Blue" },
  { value: "bg-purple-200 text-purple-800", label: "Purple" },
  { value: "bg-red-200 text-red-800", label: "Red" },
  { value: "bg-green-200 text-green-800", label: "Green" },
  { value: "bg-yellow-200 text-yellow-800", label: "Yellow" },
  { value: "bg-pink-200 text-pink-800", label: "Pink" },
  { value: "bg-indigo-200 text-indigo-800", label: "Indigo" },
  { value: "bg-gray-200 text-gray-800", label: "Gray" },
];

const TagManager = ({ tags, onAddTag, onUpdateTag, onDeleteTag }: TagManagerProps) => {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedColor, setEditedColor] = useState("");

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const tagId = newTagName.toLowerCase().replace(/\s+/g, "-");
      const newTag: Tag = {
        id: tagId + "-" + Date.now(),
        name: newTagName.trim(),
        color: newTagColor,
      };
      onAddTag(newTag);
      setNewTagName("");
    }
  };

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag);
    setEditedName(tag.name);
    setEditedColor(tag.color);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingTag && editedName.trim()) {
      onUpdateTag({
        ...editingTag,
        name: editedName.trim(),
        color: editedColor,
      });
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-medium mb-4">Manage Tags</h2>
      
      {/* Add new tag */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Input
          placeholder="New tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          className="w-40"
        />
        <Select
          value={newTagColor}
          onValueChange={(value) => setNewTagColor(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Color" />
          </SelectTrigger>
          <SelectContent>
            {TAG_COLORS.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                <div className="flex items-center gap-2">
                  <span className={cn("w-3 h-3 rounded-full", color.value.split(" ")[0])}></span>
                  {color.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddTag}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </div>
      
      {/* Tag list */}
      <div className="space-y-2">
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <Badge className={cn("text-sm", tag.color)}>
              {tag.name}
            </Badge>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => openEditDialog(tag)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit tag</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500"
                onClick={() => onDeleteTag(tag.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete tag</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="color" className="text-sm font-medium">Color</label>
              <Select
                value={editedColor}
                onValueChange={(value) => setEditedColor(value)}
              >
                <SelectTrigger id="color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {TAG_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <span className={cn("w-3 h-3 rounded-full", color.value.split(" ")[0])}></span>
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagManager;
