import React, { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile } from "lucide-react";
import emojiData from "unicode-emoji-json";
import githubShortcodes from "emojibase-data/en/shortcodes/github.json";


// Lightweight emoji picker without external deps
// - Renders a small grid of commonly used emojis
// - Calls onSelect with the chosen emoji
// - Keeps UI minimal and fast

type EmojiInfo = {
  name?: string;
  annotation?: string;
  tags?: string[];
  keywords?: string[];
  group?: string;
};

const ALL_EMOJIS: string[] = Object.keys(emojiData as Record<string, EmojiInfo>);

// Build emoji to shortcode map from GitHub-style shortcodes
const SHORTCODES_DATA = githubShortcodes as Record<string, string | string[]>;
const fromCodepoint = (seq: string) =>
  seq
    .split("-")
    .map((h) => String.fromCodePoint(parseInt(h, 16)))
    .join("");

const EMOJI_TO_SHORTCODES: Record<string, string[]> = Object.fromEntries(
  Object.entries(SHORTCODES_DATA).map(([cp, sc]) => {
    const emojiChar = fromCodepoint(cp);
    const arr = Array.isArray(sc) ? sc : [sc];
    return [emojiChar, arr.map((s) => `:${s}:`)];
  })
);



interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  label?: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, label = "Insert emoji" }) => {
const [open, setOpen] = useState(false);
const [query, setQuery] = useState("");
const isShortcodeMode = useMemo(() => query.trim().startsWith(":"), [query]);

const filtered = useMemo(() => {
  const raw = query.trim();
  const q = raw.toLowerCase();
  if (!q) return ALL_EMOJIS;

  // If user is typing a shortcode like :blu
  if (raw.startsWith(":")) {
    const sub = raw.slice(1).toLowerCase();
    return ALL_EMOJIS.filter((e) =>
      (EMOJI_TO_SHORTCODES[e] || []).some((sc) => sc.toLowerCase().includes(sub))
    );
  }

  return ALL_EMOJIS.filter((e) => {
    if (e.includes(q)) return true; // allow searching by emoji char
    const info = (emojiData as Record<string, EmojiInfo>)[e] || {};
    const haystack = [
      info.name,
      info.annotation,
      ...(info.tags || []),
      ...(info.keywords || []),
      info.group,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const scodes = EMOJI_TO_SHORTCODES[e] || [];
    return haystack.includes(q) || scodes.some((sc) => sc.toLowerCase().includes(q));
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
  placeholder="Search all emojis (type :blu for shortcodes or paste 😄)"
  aria-label="Search emojis"
  className="h-8 text-xs mb-2"
/>
<div className="space-y-1 max-h-72 overflow-auto pr-1">
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
              className={(isShortcodeMode ? "h-10 w-12 flex-col gap-1 " : "h-7 w-7 ") + "rounded-md hover:bg-accent/60 transition flex items-center justify-center"}
              onClick={() => {
                onSelect(e);
                setOpen(false);
              }}
              title={(EMOJI_TO_SHORTCODES[e]?.[0] ?? (emojiData as Record<string, EmojiInfo>)[e]?.name ?? (emojiData as Record<string, EmojiInfo>)[e]?.annotation ?? "emoji")}
              >
              {isShortcodeMode ? (
                <>
                  <span className="text-base leading-none" aria-hidden>
                    {e}
                  </span>
                  <span className="text-[10px] leading-tight text-muted-foreground max-w-[2.5rem] truncate">
                    {(EMOJI_TO_SHORTCODES[e]?.[0] ?? "")}
                  </span>
                </>
              ) : (
                <span className="text-base leading-none" aria-hidden>
                  {e}
                </span>
              )}
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
