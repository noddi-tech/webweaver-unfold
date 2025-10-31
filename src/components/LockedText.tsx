import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';

interface LockedTextProps {
  children: React.ReactNode;
  reason?: string;
}

export function LockedText({ children, reason = 'Hard-coded text' }: LockedTextProps) {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);

  if (!editMode) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative inline-block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <div className="absolute -top-2 -right-2 p-1.5 bg-muted text-muted-foreground rounded-full shadow-lg z-10 cursor-not-allowed">
          <Lock className="h-3 w-3" />
        </div>
      )}
      {isHovered && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg whitespace-nowrap z-20">
          {reason}
        </div>
      )}
    </div>
  );
}
