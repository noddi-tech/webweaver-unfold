import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { hslToHex } from "@/lib/contrastUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  if (!data) return null;

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
    setApplying(true);
    try {
      const { error } = await supabase
        .from('color_tokens')
        .update({ 
          value: fixedHsl,
          optimal_text_color: type === 'white' ? 'white' : 'dark'
        })
        .eq('css_var', data.cssVar);

      if (error) throw error;

      toast.success("Color updated successfully!");
      onRefresh();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to update color: " + error.message);
    } finally {
      setApplying(false);
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
              <h4 className="text-sm font-semibold mb-2">Fixed for White Text</h4>
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
                      Apply to Database
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.fixes.fixedDarkText && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Fixed for Dark Text</h4>
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
                      Apply to Database
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
    </Dialog>
  );
}
