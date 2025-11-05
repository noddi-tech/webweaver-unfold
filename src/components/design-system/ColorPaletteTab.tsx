import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, Download, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  ALL_BACKGROUND_OPTIONS,
  TEXT_COLOR_OPTIONS,
  ColorOption,
  TextColorOption,
  exportColorPalette,
  hslToHex,
  hslToRgb,
  copyToClipboard,
  getCssVariableValue,
  meetsContrastRequirement
} from "@/config/colorSystem";

// Map text colors to their intended backgrounds for accurate preview and contrast checking
const TEXT_COLOR_BACKGROUND_MAP: Record<string, Array<{ bg: string; label: string }>> = {
  'text-white': [
    { bg: 'bg-card', label: 'Card' },
    { bg: 'bg-gradient-hero', label: 'Hero Gradient' }
  ],
  'text-foreground': [
    { bg: 'bg-background', label: 'Background' }
  ],
  'text-card-foreground': [
    { bg: 'bg-card', label: 'Card' }
  ],
  'text-muted-foreground': [
    { bg: 'bg-background', label: 'Background' },
    { bg: 'bg-muted', label: 'Muted' }
  ],
  'text-primary-foreground': [
    { bg: 'bg-primary', label: 'Primary' }
  ],
  'text-secondary-foreground': [
    { bg: 'bg-secondary', label: 'Secondary' }
  ],
  'text-accent-foreground': [
    { bg: 'bg-accent', label: 'Accent' }
  ],
  'text-destructive-foreground': [
    { bg: 'bg-destructive', label: 'Destructive' }
  ]
};

interface ColorCategory {
  title: string;
  description: string;
  items: (ColorOption | TextColorOption)[];
  type: 'background' | 'text';
}

export function ColorPaletteTab() {
  const [copiedValue, setCopiedValue] = useState<string>("");

  const handleCopy = async (value: string, label: string, format: 'hex' | 'hsl' | 'css' = 'hex') => {
    await copyToClipboard(value, `${label} (${format.toUpperCase()})`);
    setCopiedValue(value);
    setTimeout(() => setCopiedValue(""), 2000);
  };

  const handleExport = () => {
    const paletteData = exportColorPalette();
    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `color-palette-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Palette Exported",
      description: "Color palette downloaded as JSON file",
    });
  };

  // Organize colors by category
  const categories: ColorCategory[] = [
    {
      title: "Brand Colors",
      description: "Primary, secondary, and accent colors",
      items: ALL_BACKGROUND_OPTIONS.filter(c => 
        c.category === 'interactive' && c.type === 'solid'
      ),
      type: 'background'
    },
    {
      title: "Surface Colors",
      description: "Backgrounds, cards, and muted surfaces",
      items: ALL_BACKGROUND_OPTIONS.filter(c => 
        c.category === 'surfaces' && c.type === 'solid'
      ),
      type: 'background'
    },
    {
      title: "Feedback Colors",
      description: "Success, error, and warning states",
      items: ALL_BACKGROUND_OPTIONS.filter(c => c.category === 'feedback'),
      type: 'background'
    },
    {
      title: "Gradients",
      description: "Multi-color gradient backgrounds",
      items: ALL_BACKGROUND_OPTIONS.filter(c => c.type === 'gradient'),
      type: 'background'
    },
    {
      title: "Glass Effects",
      description: "Transparent and blurred backgrounds",
      items: ALL_BACKGROUND_OPTIONS.filter(c => c.type === 'glass'),
      type: 'background'
    },
    {
      title: "Text Colors",
      description: "Semantic text color options",
      items: TEXT_COLOR_OPTIONS,
      type: 'text'
    }
  ];

  const renderBackgroundColor = (color: ColorOption) => {
    const hslValue = color.cssVar ? getCssVariableValue(color.cssVar) : '';
    const hexValue = hslValue ? hslToHex(hslValue) : '';
    const rgbValue = hslValue ? hslToRgb(hslValue) : '';

    return (
      <Card key={color.value} className="p-4 space-y-3 hover:shadow-md transition-shadow bg-background text-foreground border">
        {/* Color Preview */}
        <div className={`h-24 rounded-lg ${color.preview} border relative overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-medium ${
              color.optimalTextColor === 'white' ? 'text-white' : 'text-foreground'
            }`}>
              {color.label}
            </span>
          </div>
        </div>

        {/* Color Info */}
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold text-sm">{color.label}</h4>
            <p className="text-xs text-muted-foreground">{color.description}</p>
          </div>

          {/* CSS Variable */}
          {color.cssVar && (
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                {color.cssVar}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => handleCopy(color.cssVar!, color.label, 'css')}
              >
                {copiedValue === color.cssVar ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}

          {/* CSS Class */}
          <div className="flex items-center justify-between gap-2">
            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
              {color.value}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => handleCopy(color.value, color.label, 'css')}
            >
              {copiedValue === color.value ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>

          {/* Color Values */}
          {hslValue && (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">HSL</p>
                  <code className="text-xs">{hslValue}</code>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => handleCopy(hslValue, color.label, 'hsl')}
                >
                  {copiedValue === hslValue ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              
              {hexValue && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">HEX</p>
                    <code className="text-xs font-semibold">{hexValue}</code>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleCopy(hexValue, color.label, 'hex')}
                  >
                    {copiedValue === hexValue ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}

              {rgbValue && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">RGB</p>
                    <code className="text-xs">{rgbValue}</code>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleCopy(rgbValue, color.label, 'css')}
                  >
                    {copiedValue === rgbValue ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Optimal Text Color & Contrast */}
          {color.optimalTextColor && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Best with: <span className="font-medium">{color.optimalTextColor} text</span>
              </p>
              {color.contrastRatio && (
                <p className="text-xs text-muted-foreground">
                  Contrast: <span className="font-medium">{color.contrastRatio}:1</span>
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderTextColor = (color: TextColorOption) => {
    const backgrounds = TEXT_COLOR_BACKGROUND_MAP[color.value] || [
      { bg: 'bg-background', label: 'Background' }
    ];

    return (
      <Card key={color.value} className="p-4 space-y-3 hover:shadow-md transition-shadow bg-background text-foreground border">
        {/* Color Info Header */}
        <div>
          <h4 className="font-semibold text-sm">{color.label}</h4>
          <p className="text-xs text-muted-foreground">{color.description}</p>
        </div>

        {/* Preview on intended backgrounds with contrast info */}
        <div className="space-y-3">
          {backgrounds.map((bgInfo) => {
            // Calculate contrast using the function from colorSystem
            const contrastInfo = meetsContrastRequirement(bgInfo.bg, color.value);
            
            return (
              <div key={bgInfo.bg} className="space-y-1.5">
                {/* Background label and contrast info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">On {bgInfo.label}</span>
                  <div className="flex items-center gap-2">
                    {/* Contrast ratio */}
                    <span className="font-mono font-semibold text-foreground">{contrastInfo.ratio.toFixed(2)}:1</span>
                    
                    {/* WCAG Level Badge */}
                    <Badge 
                      variant={
                        contrastInfo.level === 'AAA' ? 'default' : 
                        contrastInfo.level === 'AA' || contrastInfo.level === 'AA Large' ? 'secondary' : 
                        'destructive'
                      }
                      className="text-xs h-5 gap-1"
                    >
                      {contrastInfo.level === 'AAA' && <CheckCircle2 className="h-3 w-3" />}
                      {contrastInfo.level === 'Fail' && <AlertCircle className="h-3 w-3" />}
                      {contrastInfo.level}
                    </Badge>
                    
                    {/* Fix button for insufficient contrast */}
                    {contrastInfo.level !== 'AAA' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          toast({
                            title: "Contrast Improvement Needed",
                            description: `${color.label} on ${bgInfo.label} has ${contrastInfo.ratio.toFixed(2)}:1 contrast (${contrastInfo.level}). For AAA compliance, aim for 7:1 or higher. Consider adjusting colors in your theme settings.`,
                            duration: 5000,
                          });
                        }}
                      >
                        Fix
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Preview box with actual background */}
                <div className={`h-16 rounded-lg ${bgInfo.bg} border flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${color.className}`}>Aa</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CSS Class - copyable */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
            {color.value}
          </code>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => handleCopy(color.value, color.label, 'css')}
          >
            {copiedValue === color.value ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Complete Color Palette</h3>
          <p className="text-sm text-muted-foreground">
            Reference guide for all available colors with copyable values
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
      </div>

      {/* Collapsible Categories */}
      <Accordion type="multiple" defaultValue={["brand-colors", "surface-colors", "text-colors"]} className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.title} value={category.title.toLowerCase().replace(/\s+/g, '-')}>
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">{category.title}</h4>
                <Badge variant="outline" className="text-xs">{category.items.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-xs text-muted-foreground mb-4">{category.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item) => 
                  category.type === 'background' 
                    ? renderBackgroundColor(item as ColorOption)
                    : renderTextColor(item as TextColorOption)
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
