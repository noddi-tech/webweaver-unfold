import React, { useMemo } from "react";
import { icons } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const IconPreview = ({ name, className = "w-4 h-4" }: { name: string; className?: string }) => {
  const LucideIcon = (icons as Record<string, any>)[name];
  if (!LucideIcon) return <span className={className} />;
  return <LucideIcon className={className} />;
};

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, placeholder = "Select icon" }) => {
  const iconNames = useMemo(() => Object.keys(icons).sort(), []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <div className="flex items-center gap-2">
          {value ? <IconPreview name={value} /> : null}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-80 overflow-y-auto z-50 bg-popover">
        {iconNames.map((name) => (
          <SelectItem key={name} value={name}>
            <div className="flex items-center gap-2">
              <IconPreview name={name} />
              <span className="capitalize">{name.replace(/-/g, " ")}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default IconPicker;
