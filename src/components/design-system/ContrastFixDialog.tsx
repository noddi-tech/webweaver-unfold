import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Copy, Check, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { hslToHex, getLuminanceFromHSL } from "@/lib/contrastUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExistingColorMatch {
  cssVar: string;
  label: string;
  value: string;
  lightnessDiff: number;
}

interface ContrastFixDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    colorId: string;
    colorName: string;
    cssVar: string;
    original: string;
    fixes: {
      fixedWhiteText: string | null;
      fixedDarkText: string | null;
      recommendation: string;
    };
    evaluation: any;
  } | null;
  onRefresh: () => void;
}

export function ContrastFixDialog({ open, onOpenChange, data, onRefresh }: ContrastFixDialogProps) {
  const [copiedWhite, setCopiedWhite] = useState(false);
  const [copiedDark, setCopiedDark] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFix, setPendingFix] = useState<{ hsl: string; type: 'white' | 'dark' } | null>(null);
  const [existingMatches, setExistingMatches] = useState<{ white?: ExistingColorMatch; dark?: ExistingColorMatch }>({});

  useEffect(() => {
    if (open && data) {
      findExistingMatches();
    }
  }, [open, data]);

  if (!data) return null;

  const getLightness = (hslValue: string): number => {
    const match = hslValue.match(/(\d+)%/g);
    return match ? parseInt(match[2]) : 50;
  };

  const findExistingMatches = async () => {
    if (!data.fixes.fixedWhiteText && !data.fixes.fixedDarkText) return;

    const { data: textColors } = await supabase
      .from('color_tokens')
      .select('css_var, label, value')
      .eq('category', 'text')
      .eq('active', true);

    if (!textColors) return;

    const matches: { white?: ExistingColorMatch; dark?: ExistingColorMatch } = {};

    // Check for white text fix match
    if (data.fixes.fixedWhiteText) {
      const targetLightness = getLightness(data.fixes.fixedWhiteText);
      const match = textColors.find(color => {
        const diff = Math.abs(getLightness(color.value) - targetLightness);
        return diff < 5; // Within 5% lightness
      });
      if (match) {
        matches.white = {
          cssVar: match.css_var,
          label: match.label,
          value: match.value,
          lightnessDiff: Math.abs(getLightness(match.value) - targetLightness)
        };
      }
    }

    // Check for dark text fix match
    if (data.fixes.fixedDarkText) {
      const targetLightness = getLightness(data.fixes.fixedDarkText);
      const match = textColors.find(color => {
        const diff = Math.abs(getLightness(color.value) - targetLightness);
        return diff < 5;
      });
      if (match) {
        matches.dark = {
          cssVar: match.css_var,
          label: match.label,
          value: match.value,
          lightnessDiff: Math.abs(getLightness(match.value) - targetLightness)
        };
      }
    }

    setExistingMatches(matches);
  };

  const handleCopy = async (text: string, type: 'white' | 'dark') => {
    await navigator.clipboard.writeText(text);
    if (type === 'white') {
      setCopiedWhite(true);
      setTimeout(() => setCopiedWhite(false), 2000);
    } else {
      setCopiedDark(true);
      setTimeout(() => setCopiedDark(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  const handleApplyFix = async (fixedHsl: string, type: 'white' | 'dark') => {
    const isSurfaceColor = data.evaluation.category !== 'text';
    
    if (isSurfaceColor) {
      // For surface/interactive colors, create a new text variant
      setPendingFix({ hsl: fixedHsl, type });
      setShowConfirmDialog(true);
    } else {
      // For text colors, also create variant to preserve original
      setPendingFix({ hsl: fixedHsl, type });
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmCreateVariant = async () => {
    if (!pendingFix) return;
    
    setApplying(true);
    setShowConfirmDialog(false);
    
    try {
      const colorName = data.cssVar.replace('--', '').replace(/-/g, '_');
      const variantSuffix = pendingFix.type === 'white' ? 'light' : 'dark';
      const newCssVar = `--text-${colorName}-${variantSuffix}`;
      const newLabel = `${data.colorName} Text (${pendingFix.type === 'white' ? 'Light BG' : 'Dark BG'})`;

      // Check if variant already exists
      const { data: existing } = await supabase
        .from('color_tokens')
        .select('id')
        .eq('css_var', newCssVar)
        .maybeSingle();

      if (existing) {
        // Update existing variant
        const { error } = await supabase
          .from('color_tokens')
          .update({ 
            value: pendingFix.hsl,
            optimal_text_color: pendingFix.type === 'white' ? 'white' : 'dark'
          })
          .eq('css_var', newCssVar);

        if (error) throw error;
        toast.success(`Updated text variant: ${newCssVar}`);
      } else {
        // Create new variant
        const { error } = await supabase
          .from('color_tokens')
          .insert({
            css_var: newCssVar,
            label: newLabel,
            value: pendingFix.hsl,
            category: 'text',
            color_type: 'solid',
            optimal_text_color: pendingFix.type === 'white' ? 'white' : 'dark',
            description: `AAA-compliant text variant of ${data.colorName}`,
            active: true,
            sort_order: 999,
            preview_class: `text-[${newCssVar}]`
          });

        if (error) throw error;
        toast.success(`Created new text variant: ${newCssVar}`);
      }

      onRefresh();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to create variant: " + error.message);
    } finally {
      setApplying(false);
      setPendingFix(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Fix Contrast: {data.colorName}</DialogTitle>
          <DialogDescription>
            Automatically adjust this color to meet WCAG AAA standards (7:1 contrast ratio)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Color */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Original Color</h4>
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 rounded-lg border"
                style={{ backgroundColor: `hsl(${data.original})` }}
              />
              <div className="space-y-1">
                <p className="text-sm font-mono">hsl({data.original})</p>
                <p className="text-sm font-mono">{hslToHex(data.original)}</p>
                <Badge variant="outline" className={`text-xs ${data.evaluation.badge.color}`}>
                  {data.evaluation.badge.label} Contrast
                </Badge>
              </div>
            </div>
          </div>

          {/* Fixed Options */}
          {data.fixes.fixedWhiteText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Fixed for White Text</h4>
                {existingMatches.white && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Similar color exists
                  </Badge>
                )}
              </div>
              
              {existingMatches.white && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 mb-2">
                    💡 <strong>Suggestion:</strong> Use existing text color
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-white px-2 py-1 rounded">
                      {existingMatches.white.cssVar}
                    </code>
                    <span className="text-xs text-blue-700">
                      ({existingMatches.white.label})
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div
                  className="w-24 h-24 rounded-lg border flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${data.fixes.fixedWhiteText})` }}
                >
                  <span className="text-white text-sm font-medium">Sample</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-mono">hsl({data.fixes.fixedWhiteText})</p>
                  <p className="text-sm font-mono">{hslToHex(data.fixes.fixedWhiteText)}</p>
                  <Badge className="text-xs text-green-600">AAA Contrast ✓</Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(data.fixes.fixedWhiteText!, 'white')}
                    >
                      {copiedWhite ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      Copy HSL
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApplyFix(data.fixes.fixedWhiteText!, 'white')}
                      disabled={applying}
                    >
                      Create Text Variant
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.fixes.fixedDarkText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Fixed for Dark Text</h4>
                {existingMatches.dark && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Similar color exists
                  </Badge>
                )}
              </div>
              
              {existingMatches.dark && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 mb-2">
                    💡 <strong>Suggestion:</strong> Use existing text color
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-white px-2 py-1 rounded">
                      {existingMatches.dark.cssVar}
                    </code>
                    <span className="text-xs text-blue-700">
                      ({existingMatches.dark.label})
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div
                  className="w-24 h-24 rounded-lg border flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${data.fixes.fixedDarkText})` }}
                >
                  <span className="text-foreground text-sm font-medium">Sample</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-mono">hsl({data.fixes.fixedDarkText})</p>
                  <p className="text-sm font-mono">{hslToHex(data.fixes.fixedDarkText)}</p>
                  <Badge className="text-xs text-green-600">AAA Contrast ✓</Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(data.fixes.fixedDarkText!, 'dark')}
                    >
                      {copiedDark ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      Copy HSL
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApplyFix(data.fixes.fixedDarkText!, 'dark')}
                      disabled={applying}
                    >
                      Create Text Variant
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-foreground">
              💡 <strong>Recommendation:</strong> {data.fixes.recommendation}
            </p>
          </div>
        </div>
      </DialogContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-background text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Create Text Variant?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will create a new text color token:{' '}
              <code className="font-mono bg-muted px-1 py-0.5 rounded text-foreground">
                --text-{data.cssVar.replace('--', '').replace(/-/g, '_')}-{pendingFix?.type === 'white' ? 'light' : 'dark'}
              </code>
              <br /><br />
              The original <strong>{data.colorName}</strong> color will remain unchanged.
              This preserves your design system while adding an AAA-compliant text alternative.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCreateVariant}>
              Create Text Variant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
