import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, Download, Check, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getOptimalTextColor, getContrastRatio, getContrastBadge } from "@/lib/contrastUtils";
import { ContrastCheckerTool } from "./ContrastCheckerTool";

interface ColorOption {
  value: string;
  label: string;
  description: string;
  preview: string;
  cssVar?: string;
  type: 'solid' | 'gradient' | 'glass';
  category: string;
  optimalTextColor?: 'white' | 'dark' | 'auto';
  hslValue?: string;
}

interface TextColorOption {
  value: string;
  label: string;
  description: string;
  preview: string;
  className: string;
}

interface ColorCategory {
  title: string;
  description: string;
  colors: ColorOption[];
}

const CATEGORY_METADATA: Record<string, { title: string; description: string }> = {
  surfaces: { title: "Surface Colors", description: "Background and surface colors for layouts, cards, and containers" },
  interactive: { title: "Interactive Colors", description: "Brand and action colors for buttons, links, and interactive elements" },
  feedback: { title: "Feedback Colors", description: "Status colors for success, warning, and error states" },
  gradients: { title: "Standard Gradients", description: "Multi-color gradient backgrounds for heroes and accents" },
  experimental: { title: "Experimental Gradients", description: "Advanced mesh gradients inspired by OpenAI & Mixpanel" },
  glass: { title: "Glass Effects", description: "Frosted glass and translucent overlay effects" }
};

const hslToHex = (hsl: string): string => {
  const match = hsl.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
  if (!match) return '#000000';
  const h = parseFloat(match[1]) / 360, s = parseFloat(match[2]) / 100, l = parseFloat(match[3]) / 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (x: number) => { const hex = Math.round(x * 255).toString(16); return hex.length === 1 ? '0' + hex : hex; };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hslToRgb = (hsl: string): string => {
  const match = hsl.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
  if (!match) return 'rgb(0, 0, 0)';
  const h = parseFloat(match[1]) / 360, s = parseFloat(match[2]) / 100, l = parseFloat(match[3]) / 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
  }
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
};

export function ColorPaletteTab() {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [categories, setCategories] = useState<ColorCategory[]>([]);
  const [textColors, setTextColors] = useState<TextColorOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadColorsFromDatabase(); }, []);

  const loadColorsFromDatabase = async () => {
    try {
      setLoading(true);
      const { data: colorTokens, error } = await supabase.from('color_tokens').select('*').eq('active', true).order('sort_order', { ascending: true });
      if (error) throw error;
      if (!colorTokens || colorTokens.length === 0) {
        toast({ title: "No Colors Found", description: "No active color tokens in database", variant: "destructive" });
        setLoading(false);
        return;
      }

      const colorsByCategory: Record<string, ColorOption[]> = {};
      const textColorOptions: TextColorOption[] = [];

      colorTokens.forEach((token) => {
        if (token.category === 'text') {
          textColorOptions.push({ value: token.preview_class || `text-[hsl(${token.value})]`, label: token.label || token.css_var, description: token.description || '', preview: token.preview_class || `text-[hsl(${token.value})]`, className: token.preview_class || `text-[hsl(${token.value})]` });
        } else {
          const category = token.category || 'other';
          if (!colorsByCategory[category]) colorsByCategory[category] = [];
          colorsByCategory[category].push({ value: token.preview_class || `bg-[hsl(${token.value})]`, label: token.label || token.css_var, description: token.description || '', preview: token.preview_class || `bg-[hsl(${token.value})]`, cssVar: token.css_var, type: (token.color_type as 'solid' | 'gradient' | 'glass') || 'solid', category: category, optimalTextColor: (token.optimal_text_color as 'white' | 'dark' | 'auto') || 'auto', hslValue: token.value });
        }
      });

      const categoryOrder = ['surfaces', 'interactive', 'feedback', 'gradients', 'experimental', 'glass'];
      const categoriesArray: ColorCategory[] = categoryOrder.filter(key => colorsByCategory[key]?.length > 0).map(key => ({ title: CATEGORY_METADATA[key]?.title || key, description: CATEGORY_METADATA[key]?.description || '', colors: colorsByCategory[key] }));
      setCategories(categoriesArray);
      setTextColors(textColorOptions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading colors:', error);
      toast({ title: "Error Loading Colors", description: "Could not load colors from database", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copied!", description: `${label} copied to clipboard` });
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch { toast({ title: "Copy Failed", description: "Could not copy to clipboard", variant: "destructive" }); }
  };

  const handleDatabaseExport = async () => {
    try {
      const { data: colorTokens, error } = await supabase.from('color_tokens').select('*').eq('active', true).order('sort_order', { ascending: true });
      if (error) throw error;
      if (!colorTokens?.length) { toast({ title: "No Colors Found", variant: "destructive" }); return; }
      const organizedColors: Record<string, any> = {};
      colorTokens.forEach((token) => {
        const category = token.category || 'other';
        if (!organizedColors[category]) organizedColors[category] = {};
        const colorEntry: any = { label: token.label || token.css_var, description: token.description || '', cssVar: token.css_var, value: token.value, type: token.color_type || 'solid', optimalTextColor: token.optimal_text_color || 'auto', previewClass: token.preview_class || '' };
        if (token.color_type === 'solid' && token.value) { colorEntry.hsl = token.value; colorEntry.hex = hslToHex(token.value); colorEntry.rgb = hslToRgb(token.value); }
        organizedColors[category][token.css_var] = colorEntry;
      });
      const exportData = { metadata: { exportDate: new Date().toISOString(), version: "2.0", source: "Navio Design System - Live Database", totalColors: colorTokens.length, format: "Figma Tokens Studio compatible" }, colors: organizedColors };
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `navio-colors-${new Date().toISOString().split('T')[0]}.json`);
      linkElement.click();
      toast({ title: "Navio Colors Exported", description: `${colorTokens.length} colors exported from database` });
    } catch (error) {
      console.error('Database export error:', error);
      toast({ title: "Export Failed", description: "Could not export colors from database", variant: "destructive" });
    }
  };

  if (loading) return (<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-3 text-muted-foreground">Loading color system from database...</span></div>);

  return (
    <div className="space-y-8">
      {/* Contrast Checker Tool */}
      <ContrastCheckerTool />
      
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-foreground">Navio Color System</h2><p className="text-muted-foreground mt-1">Database-driven color palette - single source of truth for all brand colors</p></div>
        <Button onClick={handleDatabaseExport} variant="default" size="sm"><Download className="h-4 w-4 mr-2" />Export Navio Colors</Button>
      </div>
      <Accordion type="multiple" defaultValue={categories.map((_, i) => `category-${i}`)} className="w-full">
        {categories.map((category, index) => (
          <AccordionItem key={`category-${index}`} value={`category-${index}`}>
            <AccordionTrigger className="text-lg font-semibold"><div className="flex items-center gap-3"><span>{category.title}</span><Badge variant="secondary">{category.colors.length}</Badge></div></AccordionTrigger>
            <AccordionContent><p className="text-sm text-muted-foreground mb-4">{category.description}</p><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{category.colors.map((color) => (
              <Card key={color.value} className="overflow-hidden">
                <div className={`${color.preview} h-32 flex items-center justify-center`}>
                  <span className={`text-sm font-medium ${
                    color.hslValue 
                      ? getOptimalTextColor(color.hslValue) === 'white' ? 'text-white' : 'text-foreground'
                      : 'text-white'
                  }`}>
                    {color.type === 'gradient' ? 'Gradient' : color.type === 'glass' ? 'Glass' : 'Solid'}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{color.label}</h3>
                      <Badge variant="secondary" className="text-xs">{color.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{color.description}</p>
                    
                    {/* Contrast badge and warning */}
                    {color.hslValue && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getContrastBadge(getContrastRatio(color.hslValue, '0 0% 100%')).color}`}>
                          {getContrastBadge(getContrastRatio(color.hslValue, '0 0% 100%')).label} Contrast
                        </Badge>
                        {getContrastRatio(color.hslValue, '0 0% 100%') < 4.5 && (
                          <div className="flex items-center gap-1 text-xs text-yellow-700">
                            <AlertCircle className="h-3 w-3" />
                            <span>Low contrast on light backgrounds</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {color.cssVar && (<div className="flex items-center justify-between gap-2 p-2 bg-muted rounded"><code className="text-xs font-mono text-foreground">{color.cssVar}</code><Button size="sm" variant="ghost" onClick={() => handleCopy(color.cssVar!, `${color.label} CSS Variable`)} className="h-6 w-6 p-0">{copiedValue === color.cssVar ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</Button></div>)}
                    <div className="flex items-center justify-between gap-2 p-2 bg-muted rounded"><code className="text-xs font-mono text-foreground">{color.value}</code><Button size="sm" variant="ghost" onClick={() => handleCopy(color.value, `${color.label} Class`)} className="h-6 w-6 p-0">{copiedValue === color.value ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</Button></div>
                    {color.type === 'solid' && color.hslValue && (<><div className="flex items-center justify-between gap-2 p-2 bg-muted rounded"><code className="text-xs font-mono text-foreground">hsl({color.hslValue})</code><Button size="sm" variant="ghost" onClick={() => handleCopy(`hsl(${color.hslValue})`, `${color.label} HSL`)} className="h-6 w-6 p-0">{copiedValue === `hsl(${color.hslValue})` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</Button></div>
                    <div className="flex items-center justify-between gap-2 p-2 bg-muted rounded"><code className="text-xs font-mono text-foreground">{hslToHex(color.hslValue)}</code><Button size="sm" variant="ghost" onClick={() => handleCopy(hslToHex(color.hslValue), `${color.label} HEX`)} className="h-6 w-6 p-0">{copiedValue === hslToHex(color.hslValue) ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</Button></div>
                    <div className="flex items-center justify-between gap-2 p-2 bg-muted rounded"><code className="text-xs font-mono text-foreground">{hslToRgb(color.hslValue)}</code><Button size="sm" variant="ghost" onClick={() => handleCopy(hslToRgb(color.hslValue), `${color.label} RGB`)} className="h-6 w-6 p-0">{copiedValue === hslToRgb(color.hslValue) ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</Button></div></>)}
                  </div>
                </div>
              </Card>
            ))}</div></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {textColors.length > 0 && (<div><h3 className="text-xl font-bold text-foreground mb-4">Text Colors</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{textColors.map((color) => (<Card key={color.value} className="overflow-hidden"><div className="p-6 bg-background border-b"><p className={`${color.className} text-2xl font-semibold mb-2`}>The quick brown fox jumps over the lazy dog</p><p className={`${color.className} text-sm`}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></div><div className="p-4 space-y-3"><div><h3 className="font-semibold text-foreground mb-1">{color.label}</h3><p className="text-sm text-muted-foreground">{color.description}</p></div><div className="space-y-2"><div className="flex items-center justify-between gap-2 p-2 bg-muted rounded"><code className="text-xs text-foreground">{color.className}</code><Button size="sm" variant="ghost" onClick={() => handleCopy(color.className, `${color.label} Class`)} className="h-6 w-6 p-0">{copiedValue === color.className ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</Button></div></div></div></Card>))}</div></div>)}
    </div>
  );
}
