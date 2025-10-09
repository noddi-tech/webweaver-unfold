import { useHeadings } from "@/hooks/useHeadings";
import { getTypographyClass } from "@/lib/typography";
import { getColorClass } from "@/lib/colorUtils";
import { useTypography } from "@/hooks/useTypography";

export default function ContactHero() {
  const { getHeading, headings } = useHeadings('contact', 'hero');
  const { h1, body } = useTypography();
  
  const h1Heading = headings.find(h => h.element_type === 'h1');
  const h1Class = h1Heading?.color_token ? 
    `${getTypographyClass('h1')} mb-6 ${getColorClass(h1Heading.color_token)}` : 
    `${h1} text-foreground mb-6`;
  
  const subtitleHeading = headings.find(h => h.element_type === 'subtitle');
  const subtitleClass = subtitleHeading?.color_token ? 
    `${getTypographyClass('subtitle')} max-w-3xl mx-auto ${getColorClass(subtitleHeading.color_token)}` : 
    `${body} text-muted-foreground max-w-3xl mx-auto`;
  
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className={h1Class}>
            {getHeading('h1', '')}
          </h1>
          <p className={subtitleClass}>
            {getHeading('subtitle', '')}
          </p>
        </div>
      </div>
    </section>
  );
}
