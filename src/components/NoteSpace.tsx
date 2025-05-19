
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onNoteChange(e.target.value);
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
