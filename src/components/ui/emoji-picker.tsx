import React, { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Minimal keyword index for simple search
const EMOJI_KEYWORDS: Record<string, string[]> = {
  "😀": ["grinning", "smile", "happy"],
  "😁": ["beaming", "grin", "smile"],
  "😂": ["joy", "tears", "lol", "laugh"],
  "🤣": ["rofl", "rolling", "laugh"],
  "😊": ["blush", "smile", "warm"],
  "😍": ["love", "heart eyes", "crush"],
  "🤩": ["star-struck", "amazed", "excited"],
  "😉": ["wink", "flirt", "hint"],
  "😎": ["cool", "sunglasses", "chill"],
  "🤔": ["thinking", "hmm", "question"],
  "😇": ["angel", "innocent", "halo"],
  "🙌": ["celebrate", "hooray", "raise hands"],
  "👏": ["clap", "applause", "bravo"],
  "👍": ["thumbs up", "approve", "like", "ok"],
  "🔥": ["fire", "lit", "hot", "trending"],
  "✨": ["sparkles", "shine", "magic"],
  "💡": ["idea", "lightbulb", "tip"],
  "🚀": ["rocket", "launch", "ship", "deploy"],
  "🎯": ["target", "goal", "focus", "bullseye"],
  "✅": ["check", "done", "complete", "tick"],
  "❌": ["cross", "cancel", "delete", "remove"],
  "❤️": ["heart", "love", "like", "favorite"],
  "💙": ["blue heart", "trust", "loyal"],
  "💚": ["green heart", "eco", "sustainability"],
  "⭐": ["star", "favorite", "rate"],
  "🌟": ["glow", "star", "featured", "highlight"],
  "⚙️": ["gear", "settings", "config"],
  "🧠": ["brain", "ai", "smart", "think"],
  "🛠️": ["tools", "build", "fix", "maintenance"],
  "🔧": ["wrench", "fix", "tool"],
  "📈": ["chart", "growth", "up", "analytics"],
  "📊": ["bar chart", "stats", "analytics", "report"],
  "📹": ["video camera", "record", "film"],
  "🎬": ["clapper", "movie", "action", "cut"],
  "🗂️": ["folders", "organize", "index"],
  "📁": ["folder", "files", "document"],
  "📦": ["package", "box", "ship", "deliver"],
  "🧰": ["toolbox", "tools", "kit"],
  "🧪": ["lab", "experiment", "test"],
  "🗺️": ["map", "location", "route"],
  "🏷️": ["tag", "label", "badge"],
  "📱": ["phone", "mobile", "app"],
  "💻": ["laptop", "computer", "dev", "code"],
  "🖥️": ["desktop", "monitor", "screen"],
  "🌐": ["web", "internet", "globe", "www"],
  "🔒": ["lock", "secure", "privacy"],
  "🔓": ["unlock", "open", "access"],
  "⏱️": ["timer", "stopwatch", "time", "duration"],
  "🧭": ["compass", "navigation", "direction"],
  "🪄": ["wand", "magic", "auto", "assist"],
};


const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, label = "Insert emoji" }) => {
const [open, setOpen] = useState(false);
const [query, setQuery] = useState("");

const filtered = useMemo(() => {
  if (!query.trim()) return COMMON_EMOJIS;
  const q = query.trim().toLowerCase();
  return COMMON_EMOJIS.filter((e) => {
    if (e.includes(q)) return true; // allow searching by emoji char
    const keys = EMOJI_KEYWORDS[e] || [];
    return keys.some((k) => k.toLowerCase().includes(q));
  });
}, [query]);

const groups = useMemo(() => {
  // Simple grouping for nicer scan patterns
  const size = 10;
  const chunks: string[][] = [];
  for (let i = 0; i < filtered.length; i += size) {
    chunks.push(filtered.slice(i, i + size));
  }
  return chunks;
}, [filtered]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label={label} title={label}>
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
<div className="text-xs text-muted-foreground mb-2">Pick an emoji</div>
<Input
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Search (e.g., check, fire, tools)"
  aria-label="Search emojis"
  className="h-8 text-xs mb-2"
/>
<div className="space-y-1">
  {filtered.length === 0 ? (
    <div className="text-xs text-muted-foreground py-2" aria-live="polite">
      No matches
    </div>
  ) : (
    <>
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
              title={(EMOJI_KEYWORDS[e]?.[0] ?? "emoji")}
            >
              <span className="text-base leading-none" aria-hidden>
                {e}
              </span>
            </button>
          ))}
        </div>
      ))}
    </>
  )}
</div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
