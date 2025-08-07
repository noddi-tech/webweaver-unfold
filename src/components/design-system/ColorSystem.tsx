import { Card } from "@/components/ui/card";

export const ColorSystem = () => {
  const colorCategories = [
    {
      name: "Primary Colors",
      colors: [
        { name: "Primary", class: "bg-primary text-primary-foreground", cssVar: "--primary" },
        { name: "Primary Foreground", class: "bg-primary-foreground text-primary border", cssVar: "--primary-foreground" },
      ]
    },
    {
      name: "Secondary Colors", 
      colors: [
        { name: "Secondary", class: "bg-secondary text-secondary-foreground", cssVar: "--secondary" },
        { name: "Secondary Foreground", class: "bg-secondary-foreground text-secondary border", cssVar: "--secondary-foreground" },
      ]
    },
    {
      name: "Neutral Colors",
      colors: [
        { name: "Background", class: "bg-background text-foreground border", cssVar: "--background" },
        { name: "Foreground", class: "bg-foreground text-background", cssVar: "--foreground" },
        { name: "Muted", class: "bg-muted text-muted-foreground", cssVar: "--muted" },
        { name: "Muted Foreground", class: "bg-muted-foreground text-muted border", cssVar: "--muted-foreground" },
      ]
    },
    {
      name: "Interactive Colors",
      colors: [
        { name: "Accent", class: "bg-accent text-accent-foreground", cssVar: "--accent" },
        { name: "Accent Foreground", class: "bg-accent-foreground text-accent border", cssVar: "--accent-foreground" },
        { name: "Destructive", class: "bg-destructive text-destructive-foreground", cssVar: "--destructive" },
        { name: "Destructive Foreground", class: "bg-destructive-foreground text-destructive border", cssVar: "--destructive-foreground" },
      ]
    },
    {
      name: "Border & Input",
      colors: [
        { name: "Border", class: "bg-border text-foreground", cssVar: "--border" },
        { name: "Input", class: "bg-input text-foreground border", cssVar: "--input" },
        { name: "Ring", class: "bg-ring text-background", cssVar: "--ring" },
      ]
    }
  ];

  const gradients = [
    { name: "Brand Gradient", class: "bg-gradient-to-r from-[hsl(var(--noddi-gradient-start))] to-[hsl(var(--noddi-gradient-end))]" },
    { name: "Primary Gradient", class: "bg-gradient-to-r from-primary to-primary/60" },
    { name: "Glass Gradient", class: "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl" },
  ];

  return (
    <section>
      <h2 className="text-4xl font-bold gradient-text mb-8">Color System</h2>
      <p className="text-muted-foreground mb-12 text-lg">
        Semantic color tokens that adapt to light and dark themes. Use these instead of hardcoded colors.
      </p>

      <div className="space-y-12">
        {colorCategories.map((category) => (
          <div key={category.name}>
            <h3 className="text-2xl font-semibold mb-6">{category.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.colors.map((color) => (
                <Card key={color.name} className="glass-card overflow-hidden">
                  <div className={`h-20 ${color.class} flex items-center justify-center`}>
                    <span className="font-medium">{color.name}</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-2">{color.name}</h4>
                    <code className="text-xs bg-muted px-2 py-1 rounded block mb-2">
                      {color.class}
                    </code>
                    <code className="text-xs text-muted-foreground">
                      hsl(var({color.cssVar}))
                    </code>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <div>
          <h3 className="text-2xl font-semibold mb-6">Gradients</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gradients.map((gradient) => (
              <Card key={gradient.name} className="glass-card overflow-hidden">
                <div className={`h-32 ${gradient.class} flex items-center justify-center`}>
                  <span className="font-medium text-white drop-shadow-lg">{gradient.name}</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold mb-2">{gradient.name}</h4>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    {gradient.class}
                  </code>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};