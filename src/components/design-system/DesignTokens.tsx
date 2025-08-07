import { Card } from "@/components/ui/card";

export const DesignTokens = () => {
  const tokens = [
    {
      category: "Brand Colors",
      tokens: [
        { name: "--noddi-primary", value: "252 87% 58%", color: "hsl(252, 87%, 58%)", description: "Primary brand purple" },
        { name: "--noddi-text", value: "264 58% 28%", color: "hsl(264, 58%, 28%)", description: "Dark purple text" },
        { name: "--noddi-gradient-start", value: "321 59% 85%", color: "hsl(321, 59%, 85%)", description: "Pink gradient start" },
        { name: "--noddi-gradient-end", value: "266 42% 96%", color: "hsl(266, 42%, 96%)", description: "Light purple gradient end" },
      ]
    },
    {
      category: "System Colors",
      tokens: [
        { name: "--background", value: "266 42% 96%", color: "hsl(266, 42%, 96%)", description: "Main background" },
        { name: "--foreground", value: "264 58% 28%", color: "hsl(264, 58%, 28%)", description: "Main text color" },
        { name: "--primary", value: "252 87% 58%", color: "hsl(252, 87%, 58%)", description: "Primary action color" },
        { name: "--secondary", value: "321 59% 85%", color: "hsl(321, 59%, 85%)", description: "Secondary action color" },
        { name: "--muted", value: "266 42% 92%", color: "hsl(266, 42%, 92%)", description: "Muted backgrounds" },
        { name: "--accent", value: "252 87% 58%", color: "hsl(252, 87%, 58%)", description: "Accent highlights" },
      ]
    },
    {
      category: "Spacing & Layout",
      tokens: [
        { name: "--radius", value: "1rem", description: "Base border radius" },
        { name: "Glass opacity", value: "0.1 - 0.8", description: "Background opacity for glass effects" },
        { name: "Backdrop blur", value: "20px", description: "Standard blur for glass morphism" },
      ]
    }
  ];

  return (
    <section>
      <h2 className="text-4xl font-bold gradient-text mb-8">Design Tokens</h2>
      <p className="text-muted-foreground mb-12 text-lg">
        Core design tokens that define our visual language. All colors use HSL format for consistency.
      </p>
      
      <div className="space-y-12">
        {tokens.map((category) => (
          <div key={category.category}>
            <h3 className="text-2xl font-semibold mb-6">{category.category}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {category.tokens.map((token) => (
                <Card key={token.name} className="glass-card p-6">
                  <div className="flex items-center gap-4 mb-3">
                    {token.color && (
                      <div 
                        className="w-12 h-12 rounded-lg border border-border shadow-sm"
                        style={{ backgroundColor: token.color }}
                      />
                    )}
                    <div>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {token.name}
                      </code>
                      <p className="text-sm text-muted-foreground mt-1">{token.description}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Value: </span>
                    <code className="font-mono">{token.value}</code>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};