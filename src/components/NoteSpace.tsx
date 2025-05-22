
import { useState, useEffect, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import debounce from "lodash.debounce";

interface NoteSpaceProps {
  note: string;
  onNoteChange: (note: string) => void;
  tagName: string;
}

const NoteSpace = ({ note, onNoteChange, tagName }: NoteSpaceProps) => {
  const [content, setContent] = useState(note);

  useEffect(() => {
    setContent(note);
  }, [note]);

  // Debounce the onNoteChange callback
  const debouncedOnNoteChange = useMemo(
    () => debounce(onNoteChange, 3000), // 800ms after user stops typing
    [onNoteChange]
  );

  useEffect(() => {
    return () => {
      debouncedOnNoteChange.cancel();
    };
  }, [debouncedOnNoteChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    debouncedOnNoteChange(e.target.value);
  };

  return (
    <div className={tagName ? "mb-4" : ""}>
      {tagName && <h3 className="text-lg font-medium mb-3">Notes for {tagName}</h3>}
      <Textarea
        placeholder="Write your notes here..."
        value={content}
        onChange={handleChange}
        className="min-h-[100px] w-full"
      />
    </div>
  );
};

export default NoteSpace;
