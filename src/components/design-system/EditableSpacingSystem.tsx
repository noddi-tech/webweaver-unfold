import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Copy, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpacingToken {
  name: string;
  value: number;
  unit: 'px' | 'rem';
  className: string;
  description: string;
}

const defaultSpacing: SpacingToken[] = [
  { name: "xs", value: 0.25, unit: "rem", className: "p-1", description: "Extra small spacing" },
  { name: "sm", value: 0.5, unit: "rem", className: "p-2", description: "Small spacing" },
  { name: "md", value: 1, unit: "rem", className: "p-4", description: "Medium spacing" },
  { name: "lg", value: 1.5, unit: "rem", className: "p-6", description: "Large spacing" },
  { name: "xl", value: 2, unit: "rem", className: "p-8", description: "Extra large spacing" },
  { name: "2xl", value: 2.5, unit: "rem", className: "p-10", description: "2x extra large spacing" },
  { name: "3xl", value: 3, unit: "rem", className: "p-12", description: "3x extra large spacing" },
  { name: "4xl", value: 4, unit: "rem", className: "p-16", description: "4x extra large spacing" },
];

interface RadiusToken {
  name: string;
  value: number;
  unit: 'px' | 'rem';
  className: string;
  description: string;
}

const defaultRadius: RadiusToken[] = [
  { name: "none", value: 0, unit: "px", className: "rounded-none", description: "No border radius" },
  { name: "sm", value: 0.125, unit: "rem", className: "rounded-sm", description: "Small border radius" },
  { name: "md", value: 0.375, unit: "rem", className: "rounded-md", description: "Medium border radius" },
  { name: "lg", value: 0.5, unit: "rem", className: "rounded-lg", description: "Large border radius" },
  { name: "xl", value: 0.75, unit: "rem", className: "rounded-xl", description: "Extra large border radius" },
  { name: "2xl", value: 1, unit: "rem", className: "rounded-2xl", description: "2x extra large border radius" },
  { name: "full", value: 9999, unit: "px", className: "rounded-full", description: "Fully rounded" },
];

export const EditableSpacingSystem = () => {
  const [spacing, setSpacing] = useState<SpacingToken[]>(defaultSpacing);
  const [radius, setRadius] = useState<RadiusToken[]>(defaultRadius);
  const { toast } = useToast();

  useEffect(() => {
    const savedSpacing = localStorage.getItem('noddi-spacing-system');
    const savedRadius = localStorage.getItem('noddi-radius-system');
    
    if (savedSpacing) {
      setSpacing(JSON.parse(savedSpacing));
    }
    if (savedRadius) {
      setRadius(JSON.parse(savedRadius));
    }
  }, []);

  const updateSpacing = (index: number, field: keyof SpacingToken, value: any) => {
    const newSpacing = [...spacing];
    newSpacing[index] = { ...newSpacing[index], [field]: value };
    setSpacing(newSpacing);
    
    // Apply to CSS variables
    const root = document.documentElement;
    root.style.setProperty(`--spacing-${newSpacing[index].name}`, `${newSpacing[index].value}${newSpacing[index].unit}`);
  };

  const updateRadius = (index: number, field: keyof RadiusToken, value: any) => {
    const newRadius = [...radius];
    newRadius[index] = { ...newRadius[index], [field]: value };
    setRadius(newRadius);
    
    // Apply to CSS variables
    const root = document.documentElement;
    if (newRadius[index].name === 'md') {
      root.style.setProperty('--radius', `${newRadius[index].value}${newRadius[index].unit}`);
    }
  };

  const saveSystem = () => {
    localStorage.setItem('noddi-spacing-system', JSON.stringify(spacing));
    localStorage.setItem('noddi-radius-system', JSON.stringify(radius));
    toast({
      title: "Spacing system saved",
      description: "Your spacing and radius changes have been saved locally.",
    });
  };

  const resetSystem = () => {
    setSpacing(defaultSpacing);
    setRadius(defaultRadius);
    localStorage.removeItem('noddi-spacing-system');
    localStorage.removeItem('noddi-radius-system');
    
    // Reset CSS variables
    const root = document.documentElement;
    defaultSpacing.forEach(space => {
      root.style.setProperty(`--spacing-${space.name}`, `${space.value}${space.unit}`);
    });
    root.style.setProperty('--radius', '0.5rem');
    
    toast({
      title: "Spacing system reset",
      description: "All spacing and radius values have been reset to defaults.",
    });
  };

  const copySpacing = (space: SpacingToken) => {
    navigator.clipboard.writeText(`${space.value}${space.unit}`);
    toast({
      title: "Copied to clipboard",
      description: `${space.name} spacing value copied`,
    });
  };

  const copyRadius = (rad: RadiusToken) => {
    navigator.clipboard.writeText(`${rad.value}${rad.unit}`);
    toast({
      title: "Copied to clipboard",
      description: `${rad.name} radius value copied`,
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">Spacing & Radius System</h2>
          <p className="text-muted-foreground text-lg">
            Edit your spacing and border radius tokens for consistent layouts.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetSystem}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSystem}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="space-y-12">
        {/* Spacing Tokens */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Spacing Scale</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {spacing.map((space, index) => (
              <Card key={space.name} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{space.name}</h4>
                    <p className="text-xs text-muted-foreground">{space.description}</p>
                    <code className="text-xs font-mono text-muted-foreground">{space.className}</code>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copySpacing(space)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Visual representation */}
                  <div className="border border-border rounded-sm p-2 bg-muted/20">
                    <div 
                      className="bg-primary rounded-sm"
                      style={{ 
                        padding: `${space.value}${space.unit}`,
                        minHeight: '20px'
                      }}
                    >
                      <div className="bg-primary-foreground rounded-sm h-2"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Value ({space.unit})</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={space.value}
                        onChange={(e) => updateSpacing(index, 'value', parseFloat(e.target.value))}
                        step={space.unit === 'rem' ? 0.125 : 1}
                        className="text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSpacing(index, 'unit', space.unit === 'rem' ? 'px' : 'rem')}
                        className="px-3"
                      >
                        {space.unit}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    = {space.unit === 'rem' ? (space.value * 16) + 'px' : (space.value / 16).toFixed(3) + 'rem'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Border Radius Tokens */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Border Radius Scale</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {radius.map((rad, index) => (
              <Card key={rad.name} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{rad.name}</h4>
                    <p className="text-xs text-muted-foreground">{rad.description}</p>
                    <code className="text-xs font-mono text-muted-foreground">{rad.className}</code>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyRadius(rad)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Visual representation */}
                  <div className="bg-muted/20 p-4 rounded-sm">
                    <div 
                      className="bg-primary w-16 h-16 mx-auto"
                      style={{ 
                        borderRadius: rad.name === 'full' ? '50%' : `${rad.value}${rad.unit}`
                      }}
                    />
                  </div>
                  
                  {rad.name !== 'full' && (
                    <div className="space-y-2">
                      <Label className="text-xs">Value ({rad.unit})</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={rad.value}
                          onChange={(e) => updateRadius(index, 'value', parseFloat(e.target.value))}
                          step={rad.unit === 'rem' ? 0.125 : 1}
                          className="text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateRadius(index, 'unit', rad.unit === 'rem' ? 'px' : 'rem')}
                          className="px-3"
                        >
                          {rad.unit}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {rad.name !== 'full' && (
                    <div className="text-xs text-muted-foreground">
                      = {rad.unit === 'rem' ? (rad.value * 16) + 'px' : (rad.value / 16).toFixed(3) + 'rem'}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};