import React from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

export type EmojiMatch = {
  emoji: string;
  shortcode?: string;
  name?: string;
};

interface EmojiAutocompleteProps {
  active: boolean;
  matches: EmojiMatch[];
  selectedIndex: number;
  style?: React.CSSProperties; // expects fixed positioning coords
  onPick: (match: EmojiMatch) => void;
  onHoverIndex?: (index: number) => void;
}

export const EmojiAutocomplete: React.FC<EmojiAutocompleteProps> = ({
  active,
  matches,
  selectedIndex,
  style,
  onPick,
  onHoverIndex,
}) => {
  if (!active) return null;
  return (
    <div style={{ position: "fixed", zIndex: 60, ...style }} aria-live="polite" role="listbox">
      <GlassPanel className="w-72 p-2" elevation="lg" maxHeight={256}>
        <div className="text-xs text-muted-foreground mb-1">Emoji suggestions</div>
        <div className="max-h-64 overflow-auto pr-1">
          {matches.length === 0 ? (
            <div className="text-xs text-muted-foreground py-2">No matches</div>
          ) : (
            <ul className="divide-y divide-border">
              {matches.map((m, idx) => (
                <li key={`${m.emoji}-${idx}`} role="option" aria-selected={idx === selectedIndex}>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-md",
                      idx === selectedIndex ? "bg-accent/50" : "hover:bg-accent/40",
                      "transition hover-scale"
                    )}
                    onMouseEnter={() => onHoverIndex?.(idx)}
                    onClick={() => onPick(m)}
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      {m.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{m.shortcode ?? ""}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{m.name ?? ""}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </GlassPanel>
    </div>
  );
};
