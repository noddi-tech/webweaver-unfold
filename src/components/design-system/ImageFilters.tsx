import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface DbSection {
  id: string;
  name: string;
  display_name: string;
}

interface ImageFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sectionFilter: string;
  onSectionFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sections: DbSection[];
}

export const ImageFilters = ({
  search,
  onSearchChange,
  sectionFilter,
  onSectionFilterChange,
  statusFilter,
  onStatusFilterChange,
  sections,
}: ImageFiltersProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label className="text-foreground font-medium">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or filename..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground font-medium">Section</Label>
        <Select value={sectionFilter} onValueChange={onSectionFilterChange}>
          <SelectTrigger className="text-foreground">
            <SelectValue placeholder="All sections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sections</SelectItem>
            <SelectItem value="library">Library (Unassigned)</SelectItem>
            {sections.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground font-medium">Status</Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="text-foreground">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
