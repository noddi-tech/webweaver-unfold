import React, { useRef } from "react";
import { EmojiAutocomplete } from "@/components/ui/emoji-autocomplete";
import { useEmojiAutocomplete } from "@/hooks/use-emoji-autocomplete";

interface WithEmojiAutocompleteProps {
  renderTarget: (ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>) => React.ReactNode;
  value: string;
  setValue: (newValue: string) => void;
}

export const WithEmojiAutocomplete: React.FC<WithEmojiAutocompleteProps> = ({ renderTarget, value, setValue }) => {
  const targetRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { active, matches, selectedIndex, setSelectedIndex, pick, overlayStyle } = useEmojiAutocomplete(targetRef, value, setValue);

  return (
    <>
      {renderTarget(targetRef)}
      <EmojiAutocomplete
        active={active}
        matches={matches}
        selectedIndex={selectedIndex}
        style={overlayStyle}
        onHoverIndex={setSelectedIndex}
        onPick={pick}
      />
    </>
  );
};
