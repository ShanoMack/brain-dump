import { Tag } from "@/types/task";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  tags: Tag[];
  activeTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
}

const FilterBar = ({ tags, activeTagId, onTagSelect }: FilterBarProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* All Tasks Badge */}
      <div
        className={cn(
          "cursor-pointer text-sm font-medium px-3 py-1 rounded-full border transition-colors",
          activeTagId === null
            ? "bg-slate-300 text-opacity-100 border-slate-500"
            : "border-slate-300 text-slate-500 hover:bg-slate-200"
        )}
        onClick={() => onTagSelect(null)}
      >
        All tasks
      </div>

      {/* Tag Badges */}
      {tags.map((tag) => {
        const isActive = activeTagId === tag.id;

        return (
          <div
            key={tag.id}
            className={cn(
              "cursor-pointer text-sm font-medium px-3 py-1 rounded-full border transition-colors duration-200",
              tag.color, // bg-red-500, etc.
              isActive
                ? "bg-opacity-60 border-slate-500 text-opacity-100"
                : "bg-opacity-10 border-slate-300 text-opacity-70 hover:bg-opacity-50"
            )}
            onClick={() => onTagSelect(tag.id)}
          >
            {tag.name}
          </div>
        );
      })}
    </div>
  );
};

export default FilterBar;
