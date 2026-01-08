import { useState } from "react";
import { Pencil } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { useBackgroundStyle } from "@/hooks/useBackgroundStyle";
import { UnifiedStyleModal } from "./UnifiedStyleModal";

interface TeamMemberCardProps {
  member: {
    id: string;
    name: string;
    title: string;
    image_url: string | null;
    image_object_position?: string;
  };
  pagePrefix?: string;
}

interface EditableZoneProps {
  elementId: string;
  defaultBackground: string;
  children: React.ReactNode;
  className?: string;
}

const EditableZone = ({ elementId, defaultBackground, children, className = "" }: EditableZoneProps) => {
  const { editMode } = useEditMode();
  const { background, backgroundStyle, textColor, isLoading } = useBackgroundStyle(elementId, defaultBackground);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className={`relative ${isLoading ? defaultBackground : background} ${textColor} ${className}`}
      style={backgroundStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {editMode && isHovered && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background shadow-sm border border-border z-10"
          title="Edit background"
        >
          <Pencil className="h-3.5 w-3.5 text-foreground" />
        </button>
      )}

      <UnifiedStyleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        elementIdPrefix={elementId}
      />
    </div>
  );
};

export const TeamMemberCard = ({ member, pagePrefix = "about" }: TeamMemberCardProps) => {
  const imageElementId = `${pagePrefix}-team-${member.id}-image`;
  const infoElementId = `${pagePrefix}-team-${member.id}-info`;

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-sm">
      {/* Image Section */}
      <EditableZone
        elementId={imageElementId}
        defaultBackground="bg-gradient-warmth"
        className="aspect-[4/3] relative"
      >
        {member.image_url ? (
          <img
            src={member.image_url}
            alt={member.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: member.image_object_position || "center" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white/60">
              {member.name.charAt(0)}
            </span>
          </div>
        )}
      </EditableZone>

      {/* Info Section */}
      <EditableZone
        elementId={infoElementId}
        defaultBackground="bg-background"
        className="p-5"
      >
        <h3 className="text-xl font-semibold">{member.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{member.title}</p>
      </EditableZone>
    </div>
  );
};
