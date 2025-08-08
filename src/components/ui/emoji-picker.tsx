import React, { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

// Lightweight emoji picker without external deps
// - Renders a small grid of commonly used emojis
// - Calls onSelect with the chosen emoji
// - Keeps UI minimal and fast

const COMMON_EMOJIS = [
  "😀","😁","😂","🤣","😊","😍","🤩","😉","😎","🤔",
  "😇","🙌","👏","👍","🔥","✨","💡","🚀","🎯","✅",
  "❌","❤️","💙","💚","⭐","🌟","⚙️","🧠","🛠️","🔧",
  "📈","📊","📹","🎬","🗂️","📁","📦","🧰","🧪","🗺️",
  "🏷️","📱","💻","🖥️","🌐","🔒","🔓","⏱️","🧭","🪄"
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  label?: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, label = "Insert emoji" }) => {
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => {
    // Simple grouping for nicer scan patterns
    const size = 10;
    const chunks: string[][] = [];
    for (let i = 0; i < COMMON_EMOJIS.length; i += size) {
      chunks.push(COMMON_EMOJIS.slice(i, i + size));
    }
    return chunks;
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label={label} title={label}>
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <div className="text-xs text-muted-foreground mb-2">Pick an emoji</div>
        <div className="space-y-1">
          {groups.map((row, idx) => (
            <div key={idx} className="grid grid-cols-10 gap-1">
              {row.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="h-7 w-7 rounded-md hover:bg-accent/60 transition flex items-center justify-center"
                  onClick={() => {
                    onSelect(e);
                    setOpen(false);
                  }}
                >
                  <span className="text-base leading-none" aria-hidden>
                    {e}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
