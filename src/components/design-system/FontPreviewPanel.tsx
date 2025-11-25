import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, Moon, Sparkles, CreditCard, Menu } from 'lucide-react';

interface FontPreviewPanelProps {
  fontFamily: string;
  fallbacks: string[];
  monoFamily: string;
  monoFallbacks: string[];
}

export const FontPreviewPanel = ({ fontFamily, fallbacks, monoFamily, monoFallbacks }: FontPreviewPanelProps) => {
  const [background, setBackground] = useState<'light' | 'dark' | 'gradient'>('light');
  const [activeComponent, setActiveComponent] = useState<'hero' | 'cards' | 'buttons' | 'code'>('hero');

  const primaryFont = `${fontFamily}, ${fallbacks.join(', ')}`;
  const monoFont = `${monoFamily}, ${monoFallbacks.join(', ')}`;

  const backgroundStyles = {
    light: 'bg-background text-foreground',
    dark: 'bg-[hsl(var(--primary))] text-white',
    gradient: 'bg-gradient-hero text-white',
  };

  return (
    <Card className="bg-background text-foreground">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Font Preview</CardTitle>
            <CardDescription>See how fonts look in real UI components</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={background === 'light' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setBackground('light')}
            >
              <Sun className="w-4 h-4" />
            </Button>
            <Button
              variant={background === 'dark' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setBackground('dark')}
            >
              <Moon className="w-4 h-4" />
            </Button>
            <Button
              variant={background === 'gradient' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setBackground('gradient')}
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeComponent} onValueChange={(v) => setActiveComponent(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className={`p-8 rounded-lg ${backgroundStyles[background]}`}>
            <div className="space-y-6 text-center" style={{ fontFamily: primaryFont }}>
              <Badge variant="secondary" style={{ fontFamily: primaryFont }}>New Feature</Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Transform Your Business with AI-Powered Solutions
              </h1>
              <p className="text-xl text-inherit/80 max-w-2xl mx-auto">
                Accelerate growth and drive innovation with our cutting-edge platform designed for modern enterprises.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" style={{ fontFamily: primaryFont }}>
                  Get Started
                </Button>
                <Button variant="outline" size="lg" style={{ fontFamily: primaryFont }}>
                  Learn More
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cards" className={`p-8 rounded-lg ${backgroundStyles[background]}`}>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Sparkles, title: 'Fast Performance', desc: 'Lightning-fast response times' },
                { icon: CreditCard, title: 'Simple Pricing', desc: 'Transparent and affordable' },
                { icon: Menu, title: 'Easy to Use', desc: 'Intuitive interface design' },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="bg-card text-card-foreground">
                  <CardHeader>
                    <Icon className="w-10 h-10 mb-2 text-primary" />
                    <CardTitle style={{ fontFamily: primaryFont }}>{title}</CardTitle>
                    <CardDescription style={{ fontFamily: primaryFont }}>{desc}</CardDescription>
                  </CardHeader>
                  <CardContent style={{ fontFamily: primaryFont }}>
                    <p className="text-sm text-muted-foreground">
                      Experience the power of modern technology designed to scale with your business needs.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buttons" className={`p-8 rounded-lg ${backgroundStyles[background]}`}>
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold mb-4 text-inherit/70" style={{ fontFamily: primaryFont }}>
                  Button Sizes
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Button size="sm" style={{ fontFamily: primaryFont }}>Small</Button>
                  <Button size="default" style={{ fontFamily: primaryFont }}>Default</Button>
                  <Button size="lg" style={{ fontFamily: primaryFont }}>Large</Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-4 text-inherit/70" style={{ fontFamily: primaryFont }}>
                  Button Variants
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Button style={{ fontFamily: primaryFont }}>Primary</Button>
                  <Button variant="secondary" style={{ fontFamily: primaryFont }}>Secondary</Button>
                  <Button variant="outline" style={{ fontFamily: primaryFont }}>Outline</Button>
                  <Button variant="ghost" style={{ fontFamily: primaryFont }}>Ghost</Button>
                  <Button variant="destructive" style={{ fontFamily: primaryFont }}>Destructive</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className={`p-8 rounded-lg ${backgroundStyles[background]}`}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-inherit" style={{ fontFamily: primaryFont }}>
                Monospace Font Preview
              </h3>
              <pre
                className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm"
                style={{ fontFamily: monoFont }}
              >
{`// Example TypeScript code
interface User {
  id: string;
  name: string;
  email: string;
}

const fetchUser = async (id: string): Promise<User> => {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
};

const users = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" }
];`}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-6">
          <h4 className="text-sm font-semibold mb-4 text-muted-foreground">Typography Scale</h4>
          <div className="space-y-2">
            {[
              { size: '72px', label: 'Display', weight: 900 },
              { size: '48px', label: 'H1', weight: 700 },
              { size: '36px', label: 'H2', weight: 600 },
              { size: '24px', label: 'H3', weight: 600 },
              { size: '18px', label: 'Body Large', weight: 400 },
              { size: '14px', label: 'Body Small', weight: 400 },
            ].map(({ size, label, weight }) => (
              <div key={label} className="flex items-baseline gap-4 text-foreground">
                <span className="text-xs text-muted-foreground w-24">{label}</span>
                <span style={{ fontSize: size, fontWeight: weight, fontFamily: primaryFont }}>
                  The quick brown fox
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
