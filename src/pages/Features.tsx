import Header from "@/components/Header";
import Features from "@/components/Features";
import { useHeadings } from "@/hooks/useHeadings";

const FeaturesPage = () => {
  const { getHeading } = useHeadings('features', 'hero');
  
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      
      <main className="container mx-auto px-6 py-12 pt-32">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold gradient-text mb-6">
            {getHeading('h1', 'Features')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {getHeading('subtitle', 'Discover what makes our platform special')}
          </p>
        </div>

        <Features />
      </main>
    </div>
  );
};

export default FeaturesPage;