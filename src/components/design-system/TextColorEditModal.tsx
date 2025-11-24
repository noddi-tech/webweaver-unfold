import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getContrastRatio, getContrastBadge, adjustColorForContrast } from '@/lib/contrastUtils';
import { Copy, Check, Wand2, Loader2 } from 'lucide-react';

interface TextColorEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colorId: string;
  colorName: string;
  cssVar: string;
  currentValue: string;
  onSave?: () => void;
}

export function TextColorEditModal({
  open,
  onOpenChange,
  colorId,
  colorName,
  cssVar,
  currentValue,
  onSave,
}: TextColorEditModalProps) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightness, setLightness] = useState(0);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && currentValue) {
      parseHSL(currentValue);
    }
  }, [open, currentValue]);

  const parseHSL = (hslString: string) => {
    const match = hslString.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
    if (match) {
      setHue(parseFloat(match[1]));
      setSaturation(parseFloat(match[2]));
      setLightness(parseFloat(match[3]));
    }
  };

  const currentHSL = `${hue} ${saturation}% ${lightness}%`;
  const contrastOnLight = getContrastRatio(currentHSL, '0 0% 100%');
  const contrastOnDark = getContrastRatio(currentHSL, '249 67% 24%');
  const badgeOnLight = getContrastBadge(contrastOnLight);
  const badgeOnDark = getContrastBadge(contrastOnDark);

  const handleAutoFixAAA = () => {
    // Fix for light background (white)
    const fixedForLight = adjustColorForContrast(currentHSL, '0 0% 100%', 7.0);
    if (fixedForLight) {
      parseHSL(fixedForLight);
      toast({ title: "Auto-fixed", description: "Color adjusted for AAA contrast on light backgrounds" });
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "HSL value copied to clipboard" });
    } catch {
      toast({ title: "Copy Failed", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('color_tokens')
        .update({ value: currentHSL })
        .eq('id', colorId);

      if (error) throw error;

      toast({ title: "Success", description: `${colorName} updated successfully` });
      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving color:', error);
      toast({ title: "Error", description: "Failed to save color", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Text Color: {colorName}</DialogTitle>
          <DialogDescription>
            Adjust HSL values and ensure AAA contrast compliance (7:1 ratio)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* HSL Sliders */}
          <div className="space-y-4">
            <div>
              <Label>Hue: {hue}°</Label>
              <Slider
                value={[hue]}
                onValueChange={([v]) => setHue(v)}
                min={0}
                max={360}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Saturation: {saturation}%</Label>
              <Slider
                value={[saturation]}
                onValueChange={([v]) => setSaturation(v)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Lightness: {lightness}%</Label>
              <Slider
                value={[lightness]}
                onValueChange={([v]) => setLightness(v)}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-3">
            <Label>Live Preview</Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Light Background Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-white p-6 flex items-center justify-center" style={{ color: `hsl(${currentHSL})` }}>
                  <p className="text-lg font-medium">The quick brown fox</p>
                </div>
                <div className="bg-muted p-3 space-y-2">
                  <p className="text-xs font-medium text-foreground">On Light Background</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={badgeOnLight.color}>
                      {badgeOnLight.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{contrastOnLight.toFixed(2)}:1</span>
                  </div>
                </div>
              </div>

              {/* Dark Background Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="p-6 flex items-center justify-center" style={{ backgroundColor: 'hsl(249 67% 24%)', color: `hsl(${currentHSL})` }}>
                  <p className="text-lg font-medium">The quick brown fox</p>
                </div>
                <div className="bg-muted p-3 space-y-2">
                  <p className="text-xs font-medium text-foreground">On Dark Background</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={badgeOnDark.color}>
                      {badgeOnDark.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{contrastOnDark.toFixed(2)}:1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-fix Button */}
          {contrastOnLight < 7.0 && (
            <Button variant="outline" onClick={handleAutoFixAAA} className="w-full">
              <Wand2 className="h-4 w-4 mr-2" />
              Auto-fix for AAA Contrast (7:1)
            </Button>
          )}

          {/* HSL Value */}
          <div className="space-y-2">
            <Label>HSL Value</Label>
            <div className="flex gap-2">
              <Input value={`hsl(${currentHSL})`} readOnly className="font-mono text-sm" />
              <Button size="icon" variant="outline" onClick={() => handleCopy(`hsl(${currentHSL})`)}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
