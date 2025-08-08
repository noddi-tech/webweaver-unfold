import { useEffect, useMemo, useRef, useState } from "react";
import emojiData from "unicode-emoji-json";
import githubShortcodes from "emojibase-data/en/shortcodes/github.json";

export type TargetEl = HTMLInputElement | HTMLTextAreaElement;

type EmojiInfo = {
  name?: string;
  annotation?: string;
  tags?: string[];
  keywords?: string[];
  group?: string;
};

const ALL_EMOJIS: string[] = Object.keys(emojiData as Record<string, EmojiInfo>);
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

export type EmojiSuggestion = { emoji: string; shortcode?: string; name?: string };

function getSuggestions(query: string, limit = 50): EmojiSuggestion[] {
  const q = query.toLowerCase();
  const scored: { s: EmojiSuggestion; score: number }[] = [];

  for (const e of ALL_EMOJIS) {
    const info = (emojiData as Record<string, EmojiInfo>)[e] || {};
    const scodes = EMOJI_TO_SHORTCODES[e] || [];
    const primary = scodes[0];
    const name = info.name || info.annotation || "";

    // scoring: prefix match on shortcode best, then substring in shortcode/name/tags
    let score = 0;
    if (primary?.toLowerCase().startsWith(`:${q}`)) score += 100;
    if (primary?.toLowerCase().includes(q)) score += 40;

    const hay = [name, ...(info.tags || []), ...(info.keywords || [])].join(" ").toLowerCase();
    if (hay.startsWith(q)) score += 30;
    if (hay.includes(q)) score += 10;

    if (q && score === 0) continue;

    scored.push({ s: { emoji: e, shortcode: primary, name }, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((r) => r.s);
}

const TRIGGER_RE = /(^|\s):([a-z0-9_+\-]*)$/i;

export function useEmojiAutocomplete(targetRef: React.RefObject<TargetEl>) {
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<EmojiSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const closeTimer = useRef<number | null>(null);

  const reset = () => {
    setActive(false);
    setQuery("");
    setMatches([]);
    setSelectedIndex(0);
  };

  const updateQueryFromCaret = () => {
    const el = targetRef.current;
    if (!el) return;
    const caret = el.selectionStart ?? 0;
    const before = el.value.slice(0, caret);
    const m = before.match(TRIGGER_RE);
    if (m) {
      const q = m[2] ?? "";
      setQuery(q);
      setActive(true);
      setMatches(getSuggestions(q));
      setSelectedIndex(0);
      // keep focus on the target while the menu is open
      el.focus({ preventScroll: true });
      const rect = el.getBoundingClientRect();
      setPosition({ top: rect.bottom + 6, left: rect.left + 8 });
    } else {
      reset();
    }
  };

  const pick = (s: EmojiSuggestion) => {
    const el = targetRef.current;
    if (!el) return;
    const caret = el.selectionStart ?? 0;
    const before = el.value.slice(0, caret);
    const after = el.value.slice(el.selectionEnd ?? caret);
    const m = before.match(TRIGGER_RE);
    if (!m) return;
    const start = (m.index ?? (before.length - (m[0]?.length ?? 0))) + (m[1]?.length ?? 0);
    const newBefore = before.slice(0, start) + s.emoji + " ";
    const nextVal = newBefore + after;
    el.value = nextVal;
    const newPos = newBefore.length;
    el.setSelectionRange(newPos, newPos);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    reset();
  };

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const onInput = () => updateQueryFromCaret();
    const onKeyUp = () => updateQueryFromCaret();

    const onKeyDown = (e: KeyboardEvent) => {
      // Only intercept keys when the menu is open and the user isn't composing text
      if (!active) return;
      const anyEvent = e as unknown as { isComposing?: boolean };
      if (anyEvent.isComposing) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % Math.max(matches.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + Math.max(matches.length, 1)) % Math.max(matches.length, 1));
      } else if ((e.key === "Enter" && !e.shiftKey) || e.key === "Tab") {
        e.preventDefault();
        const chosen = matches[selectedIndex];
        if (chosen) pick(chosen);
      } else if (e.key === "Escape") {
        e.preventDefault();
        reset();
      }
      // Do not preventDefault for any other keys; let typing flow normally.
    };

    const onBlur = () => {
      // Delay to allow click on suggestion
      closeTimer.current = window.setTimeout(() => reset(), 150);
    };

    el.addEventListener("input", onInput);
    el.addEventListener("keyup", onKeyUp);
    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("blur", onBlur);

    return () => {
      el.removeEventListener("input", onInput);
      el.removeEventListener("keyup", onKeyUp);
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("blur", onBlur);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, [active, matches, selectedIndex]);

  const overlayStyle: React.CSSProperties = useMemo(
    () => ({ top: position.top, left: position.left }),
    [position]
  );

  return {
    active,
    query,
    matches,
    selectedIndex,
    setSelectedIndex,
    pick,
    overlayStyle,
  } as const;
}
