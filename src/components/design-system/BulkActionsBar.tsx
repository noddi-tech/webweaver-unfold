import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CheckSquare, FolderInput } from "lucide-react";
import { useState } from "react";

interface DbSection {
  id: string;
  name: string;
  display_name: string;
}

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkAssignSection: (section: string) => void;
  sections: DbSection[];
}

export const BulkActionsBar = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkAssignSection,
  sections,
}: BulkActionsBarProps) => {
  const [assignSection, setAssignSection] = useState<string>("");

  const handleAssignSection = () => {
    if (assignSection) {
      onBulkAssignSection(assignSection);
      setAssignSection("");
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-10 bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {selectedCount} of {totalCount} selected
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {selectedCount < totalCount && (
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              Select All ({totalCount})
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>

          <div className="flex items-center gap-2">
            <Select value={assignSection} onValueChange={setAssignSection}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Assign to section..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Library">Library (Unassigned)</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handleAssignSection}
              disabled={!assignSection}
            >
              <FolderInput className="h-4 w-4 mr-1" />
              Assign
            </Button>
          </div>

          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onBulkDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete ({selectedCount})
          </Button>
        </div>
      </div>
    </div>
  );
};
