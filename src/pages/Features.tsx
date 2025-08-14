import Header from "@/components/Header";
import Features from "@/components/Features";
import { useHeadings } from "@/hooks/useHeadings";
import { getTypographyClass } from "@/lib/typography";
import { getColorClass } from "@/lib/colorUtils";

const FeaturesPage = () => {
  const { getHeading, headings } = useHeadings('features', 'hero');
  
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      
      <main className="container mx-auto px-6 py-12 pt-32">
        <div className="text-center mb-16">
          {(() => {
            const h1Heading = headings.find(h => h.element_type === 'h1');
            const h1Class = h1Heading?.color_token ? 
              `${getTypographyClass('h1')} mb-6 ${getColorClass(h1Heading.color_token)}` : 
              'text-6xl font-bold gradient-text mb-6';
            
            const subtitleHeading = headings.find(h => h.element_type === 'subtitle');
            const subtitleClass = subtitleHeading?.color_token ? 
              `${getTypographyClass('subtitle')} max-w-3xl mx-auto ${getColorClass(subtitleHeading.color_token)}` : 
              'text-xl text-muted-foreground max-w-3xl mx-auto';
            
            return (
              <>
                <h1 className={h1Class}>
                  {getHeading('h1', '')}
                </h1>
                <p className={subtitleClass}>
                  {getHeading('subtitle', '')}
                </p>
              </>
            );
          })()}
        </div>

        <Features />
      </main>
    </div>
  );
};

export default FeaturesPage;