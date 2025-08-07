import Header from "@/components/Header";
import Features from "@/components/Features";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      
      <main className="container mx-auto px-6 py-12 pt-32">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold gradient-text mb-6">
            Our Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the powerful capabilities that make our platform the perfect choice for your business needs.
          </p>
        </div>

        <Features />
      </main>
    </div>
  );
};

export default FeaturesPage;