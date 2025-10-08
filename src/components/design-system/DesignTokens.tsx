import { Card } from "@/components/ui/card";

export const DesignTokens = () => {
  const tokens = [
    {
      category: "Darkpurple Scale (Primary Text & Actions)",
      tokens: [
        { name: "--color-darkpurple-30", value: "264 45% 95%", color: "hsl(264, 45%, 95%)", description: "Lightest darkpurple" },
        { name: "--color-darkpurple-50", value: "264 50% 75%", color: "hsl(264, 50%, 75%)", description: "Mid darkpurple" },
        { name: "--color-darkpurple-70", value: "264 55% 45%", color: "hsl(264, 55%, 45%)", description: "Primary CTA" },
        { name: "--color-darkpurple-90", value: "264 58% 20%", color: "hsl(264, 58%, 20%)", description: "Primary text" },
      ]
    },
    {
      category: "Purple Scale (Brand Accent)",
      tokens: [
        { name: "--color-purple-40", value: "252 85% 85%", color: "hsl(252, 85%, 85%)", description: "Light purple" },
        { name: "--color-purple-70", value: "252 87% 58%", color: "hsl(252, 87%, 58%)", description: "Brand purple" },
        { name: "--color-purple-90", value: "252 85% 38%", color: "hsl(252, 85%, 38%)", description: "Dark purple" },
      ]
    },
    {
      category: "Raspberry Scale (Secondary Actions)",
      tokens: [
        { name: "--color-raspberry-30", value: "321 55% 92%", color: "hsl(321, 55%, 92%)", description: "Lightest raspberry" },
        { name: "--color-raspberry-40", value: "321 57% 85%", color: "hsl(321, 57%, 85%)", description: "Secondary CTA" },
        { name: "--color-raspberry-60", value: "321 59% 65%", color: "hsl(321, 59%, 65%)", description: "Raspberry accent" },
      ]
    },
    {
      category: "Bone Neutrals (Backgrounds & Muted)",
      tokens: [
        { name: "--color-bone-10", value: "35 20% 98%", color: "hsl(35, 20%, 98%)", description: "Lightest bone (bg)" },
        { name: "--color-bone-30", value: "35 16% 88%", color: "hsl(35, 16%, 88%)", description: "Border/divider" },
        { name: "--color-bone-50", value: "35 12% 62%", color: "hsl(35, 12%, 62%)", description: "Muted text" },
        { name: "--color-bone-90", value: "35 14% 12%", color: "hsl(35, 14%, 12%)", description: "Darkest bone" },
      ]
    },
    {
      category: "Semantic Tokens",
      tokens: [
        { name: "--text-primary", value: "var(--color-darkpurple-90)", color: "hsl(264, 58%, 20%)", description: "Primary text" },
        { name: "--text-secondary", value: "var(--color-darkpurple-70)", color: "hsl(264, 55%, 45%)", description: "Secondary text" },
        { name: "--text-muted", value: "var(--color-bone-50)", color: "hsl(35, 12%, 62%)", description: "Muted text" },
        { name: "--interactive-primary", value: "var(--color-darkpurple-70)", color: "hsl(264, 55%, 45%)", description: "Primary CTA" },
        { name: "--interactive-secondary", value: "var(--color-raspberry-40)", color: "hsl(321, 57%, 85%)", description: "Secondary CTA" },
        { name: "--focus-ring", value: "var(--color-purple-70)", color: "hsl(252, 87%, 58%)", description: "Focus outline" },
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