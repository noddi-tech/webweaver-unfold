import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EditableKeyBenefit } from "@/components/EditableKeyBenefit";
import { EditableImage } from "@/components/EditableImage";

interface KeyBenefitItemProps {
  benefit: {
    id: string;
    heading: string;
    description: string;
    imageUrl: string;
  };
  solutionId: string;
  benefitIndex: number;
  onContentSave: () => void;
  onImageSave: (index: number, newUrl: string) => void;
}

export function KeyBenefitItem({
  benefit,
  solutionId,
  benefitIndex,
  onContentSave,
  onImageSave
}: KeyBenefitItemProps) {
  const textAnimation = useScrollAnimation({ threshold: 0.2 });
  const imageAnimation = useScrollAnimation({ threshold: 0.2 });

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Text Content - Always on Left */}
      <div 
        ref={textAnimation.ref as any}
        className={`transition-all duration-700 ${
          textAnimation.isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-12'
        }`}
      >
        <EditableKeyBenefit
          solutionId={solutionId}
          benefitIndex={benefitIndex}
          field="heading"
          onSave={onContentSave}
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {benefit.heading}
          </h3>
        </EditableKeyBenefit>
        <EditableKeyBenefit
          solutionId={solutionId}
          benefitIndex={benefitIndex}
          field="description"
          onSave={onContentSave}
        >
          <p className="text-lg text-muted-foreground leading-relaxed">
            {benefit.description}
          </p>
        </EditableKeyBenefit>
      </div>
      
      {/* Image - Always on Right */}
      <div
        ref={imageAnimation.ref as any}
        className={`transition-all duration-700 ${
          imageAnimation.isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-12'
        }`}
      >
        <EditableImage
          imageUrl={benefit.imageUrl || null}
          onSave={(newUrl) => onImageSave(benefitIndex, newUrl)}
          altText={benefit.heading}
          placeholder="Add benefit image"
          aspectRatio="4/3"
        >
          {benefit.imageUrl && (
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={benefit.imageUrl}
                alt={benefit.heading}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </EditableImage>
      </div>
    </div>
  );
}
