import { Card } from "@/components/ui/card";

export const SpacingSystem = () => {
  const spacingScale = [
    { name: "0", value: "0px", class: "p-0" },
    { name: "0.5", value: "2px", class: "p-0.5" },
    { name: "1", value: "4px", class: "p-1" },
    { name: "1.5", value: "6px", class: "p-1.5" },
    { name: "2", value: "8px", class: "p-2" },
    { name: "2.5", value: "10px", class: "p-2.5" },
    { name: "3", value: "12px", class: "p-3" },
    { name: "3.5", value: "14px", class: "p-3.5" },
    { name: "4", value: "16px", class: "p-4" },
    { name: "5", value: "20px", class: "p-5" },
    { name: "6", value: "24px", class: "p-6" },
    { name: "7", value: "28px", class: "p-7" },
    { name: "8", value: "32px", class: "p-8" },
    { name: "10", value: "40px", class: "p-10" },
    { name: "12", value: "48px", class: "p-12" },
    { name: "16", value: "64px", class: "p-16" },
    { name: "20", value: "80px", class: "p-20" },
    { name: "24", value: "96px", class: "p-24" },
  ];

  const spacingTypes = [
    { name: "Padding", prefix: "p", description: "Internal spacing within elements" },
    { name: "Margin", prefix: "m", description: "External spacing between elements" },
    { name: "Gap", prefix: "gap", description: "Spacing between flex/grid items" },
    { name: "Space Between", prefix: "space-x/y", description: "Spacing between child elements" },
  ];

  const commonPatterns = [
    { name: "Container", classes: "container mx-auto px-6", description: "Standard page container with horizontal padding" },
    { name: "Section Spacing", classes: "py-12 md:py-16 lg:py-20", description: "Vertical spacing for major sections" },
    { name: "Card Padding", classes: "p-6", description: "Standard padding for cards and panels" },
    { name: "Button Spacing", classes: "px-4 py-2", description: "Standard button padding" },
    { name: "Form Spacing", classes: "space-y-4", description: "Vertical spacing between form fields" },
    { name: "Grid Gap", classes: "gap-6", description: "Standard gap for grid layouts" },
  ];

  return (
    <section>
      <h2 className="text-4xl font-bold gradient-text mb-8">Spacing System</h2>
      <p className="text-muted-foreground mb-12 text-lg">
        Consistent spacing scale for layout, padding, margins, and component spacing.
      </p>

      <div className="space-y-12">
        {/* Spacing Scale */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Spacing Scale</h3>
          <Card className="glass-card p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {spacingScale.map((space) => (
                <div key={space.name} className="text-center">
                  <div className="bg-primary/20 border border-primary/40 mb-2 flex items-center justify-center"
                       style={{ height: '60px' }}>
                    <div 
                      className="bg-primary rounded"
                      style={{ 
                        width: space.value === '0px' ? '2px' : space.value,
                        height: space.value === '0px' ? '2px' : space.value,
                        maxWidth: '40px',
                        maxHeight: '40px'
                      }}
                    />
                  </div>
                  <div className="text-sm font-medium">{space.name}</div>
                  <div className="text-xs text-muted-foreground">{space.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Spacing Types */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Spacing Types</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {spacingTypes.map((type) => (
              <Card key={type.name} className="glass-card p-6">
                <h4 className="text-lg font-medium mb-2">{type.name}</h4>
                <p className="text-muted-foreground mb-4">{type.description}</p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Prefix: </span>
                    <code className="font-mono">{type.prefix}-</code>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Example: </span>
                    <code className="font-mono bg-muted px-2 py-1 rounded">
                      {type.prefix}-4
                    </code>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Common Patterns */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Common Spacing Patterns</h3>
          <div className="grid gap-6">
            {commonPatterns.map((pattern) => (
              <Card key={pattern.name} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium">{pattern.name}</h4>
                    <p className="text-muted-foreground">{pattern.description}</p>
                  </div>
                </div>
                <code className="bg-muted px-3 py-2 rounded text-sm block">
                  className="{pattern.classes}"
                </code>
              </Card>
            ))}
          </div>
        </div>

        {/* Responsive Spacing */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Responsive Spacing</h3>
          <Card className="glass-card p-6">
            <h4 className="text-lg font-medium mb-4">Responsive Utilities</h4>
            <div className="space-y-4">
              <div>
                <code className="bg-muted px-3 py-2 rounded text-sm block mb-2">
                  className="p-4 md:p-6 lg:p-8"
                </code>
                <p className="text-sm text-muted-foreground">
                  Progressive padding increase: 16px → 24px → 32px
                </p>
              </div>
              <div>
                <code className="bg-muted px-3 py-2 rounded text-sm block mb-2">
                  className="py-12 md:py-16 lg:py-20"
                </code>
                <p className="text-sm text-muted-foreground">
                  Section vertical spacing: 48px → 64px → 80px
                </p>
              </div>
              <div>
                <code className="bg-muted px-3 py-2 rounded text-sm block mb-2">
                  className="gap-4 md:gap-6 lg:gap-8"
                </code>
                <p className="text-sm text-muted-foreground">
                  Grid gap responsive: 16px → 24px → 32px
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};