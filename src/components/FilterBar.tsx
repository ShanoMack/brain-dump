
import { Tag } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  tags: Tag[];
  activeTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
}

const FilterBar = ({ tags, activeTagId, onTagSelect }: FilterBarProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={activeTagId === null ? "default" : "outline"}
        className={cn(
          "cursor-pointer text-sm px-3 py-1 bg-opacity-80 hover:bg-opacity-100",
          activeTagId === null
            ? "bg-purple-600 hover:bg-purple-700"
            : "hover:bg-gray-100"
        )}
        onClick={() => onTagSelect(null)}
      >
        All Tasks
      </Badge>
      
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant={activeTagId === tag.id ? "default" : "outline"}
          className={cn(
            "cursor-pointer text-sm px-3 py-1",
            activeTagId === tag.id ? tag.color : "hover:bg-gray-100"
          )}
          onClick={() => onTagSelect(tag.id)}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
};

export default FilterBar;
