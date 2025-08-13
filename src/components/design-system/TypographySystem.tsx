import { Card } from "@/components/ui/card";
import { TYPOGRAPHY_SCALE } from "@/lib/typography";

export const TypographySystem = () => {
  const { headings, bodyText, weights, specialStyles } = TYPOGRAPHY_SCALE;

  return (
    <section>
      <h2 className="text-4xl font-bold gradient-text mb-8">Typography System</h2>
      <p className="text-muted-foreground mb-12 text-lg">
        Typography scale and styles using Inter font family with proper semantic hierarchy.
      </p>

      <div className="space-y-12">
        {/* Headings */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Headings</h3>
          <div className="grid gap-6">
            {headings.map((heading) => (
              <Card key={heading.tag} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={heading.class}>{heading.sample}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tag: </span>
                    <code className="font-mono">&lt;{heading.tag}&gt;</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Classes: </span>
                    <code className="font-mono">{heading.class}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Usage: </span>
                    <span>{heading.description}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Body Text */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Body Text</h3>
          <div className="grid gap-6">
            {bodyText.map((text) => (
              <Card key={text.name} className="glass-card p-6">
                <div className={`${text.class} mb-4`}>{text.sample}</div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium">{text.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Class: </span>
                    <code className="font-mono">{text.class}</code>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Font Weights */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Font Weights</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {weights.map((weight) => (
              <Card key={weight.name} className="glass-card p-6 text-center">
                <div className={`text-2xl ${weight.class} mb-2`}>Aa</div>
                <div className="text-sm font-medium">{weight.name}</div>
                <div className="text-xs text-muted-foreground">{weight.weight}</div>
                <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                  {weight.class}
                </code>
              </Card>
            ))}
          </div>
        </div>

        {/* Special Styles */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Special Styles</h3>
          <div className="grid gap-6">
            {specialStyles.map((style) => (
              <Card key={style.name} className="glass-card p-6">
                <div className={`${style.class} mb-4`}>{style.sample}</div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Style: </span>
                    <span className="font-medium">{style.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Classes: </span>
                    <code className="font-mono">{style.class}</code>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};