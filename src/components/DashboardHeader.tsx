// components/DashboardHeader.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import FilterBar from "./FilterBar";
import { Edit, LogOut, Tag, Tags } from "lucide-react";

type TagType = {
  id: string;
  name: string;
  color: string;
};

interface DashboardHeaderProps {
  tags: TagType[];
  activeTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
  setShowTagManager: (show: boolean) => void;
}

const DashboardHeader = ({
  tags,
  activeTagId,
  onTagSelect,
  setShowTagManager,
}: DashboardHeaderProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[64px] bg-white border-b flex flex-col justify-center py-1 px-6 z-50 shadow-sm">
      <div className="flex items-center justify-between mt-2 mb-2">
        {/* Left side: Logo + FilterBar */}
        <div className="flex items-center gap-4">
          <img src="src/art/brain-dump-icon.png" alt="Logo" className="w-[32px] h-[32px]" />
          <FilterBar tags={tags} activeTagId={activeTagId} onTagSelect={onTagSelect} />
        </div>
        {/* Right side: Buttons */}
        <div className="flex gap-2">
          {/*<span className="text-sm text-slate-500">{user?.email}</span>*/}
          <Button
            variant="outline"
            size="icon"
            className="flex items-center gap-2 bg-white"
            onClick={() => setShowTagManager(true)}
          >
            <Tag className="w-[32px] h-[32px]" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="w-[32px] h-[32px]" />
          </Button>
        </div>
      </div>
      <div className="pt-1"></div>
    </header>
  );
};

export default DashboardHeader;
