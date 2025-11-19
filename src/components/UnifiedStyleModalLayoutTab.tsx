import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface LayoutTabProps {
  cardHeight: string;
  setCardHeight: (value: string) => void;
  cardWidth: string;
  setCardWidth: (value: string) => void;
  cardBorderRadius: string;
  setCardBorderRadius: (value: string) => void;
  cardGap: string;
  setCardGap: (value: string) => void;
}

export function UnifiedStyleModalLayoutTab({
  cardHeight,
  setCardHeight,
  cardWidth,
  setCardWidth,
  cardBorderRadius,
  setCardBorderRadius,
  cardGap,
  setCardGap,
}: LayoutTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Card Layout</h3>
      
      {/* Card Height */}
      <div className="space-y-2">
        <Label className="text-foreground">Card Height</Label>
        <Select value={cardHeight} onValueChange={setCardHeight}>
          <SelectTrigger className="bg-background text-foreground border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="h-[400px]" className="text-foreground">Small (400px)</SelectItem>
            <SelectItem value="h-[500px]" className="text-foreground">Medium (500px)</SelectItem>
            <SelectItem value="h-[600px]" className="text-foreground">Large (600px)</SelectItem>
            <SelectItem value="h-[700px]" className="text-foreground">X-Large (700px)</SelectItem>
            <SelectItem value="h-[800px]" className="text-foreground">Huge (800px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Card Width */}
      <div className="space-y-2">
        <Label className="text-foreground">Card Width</Label>
        <Select value={cardWidth} onValueChange={setCardWidth}>
          <SelectTrigger className="bg-background text-foreground border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="w-full" className="text-foreground">Full Width (100%)</SelectItem>
            <SelectItem value="w-11/12" className="text-foreground">Wide (92%)</SelectItem>
            <SelectItem value="w-5/6" className="text-foreground">Medium (83%)</SelectItem>
            <SelectItem value="w-3/4" className="text-foreground">Narrow (75%)</SelectItem>
            <SelectItem value="w-2/3" className="text-foreground">Compact (67%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Border Radius */}
      <div className="space-y-2">
        <Label className="text-foreground">Corner Rounding</Label>
        <Select value={cardBorderRadius} onValueChange={setCardBorderRadius}>
          <SelectTrigger className="bg-background text-foreground border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="rounded-none" className="text-foreground">None</SelectItem>
            <SelectItem value="rounded-sm" className="text-foreground">Small (2px)</SelectItem>
            <SelectItem value="rounded-md" className="text-foreground">Medium (6px)</SelectItem>
            <SelectItem value="rounded-lg" className="text-foreground">Large (8px)</SelectItem>
            <SelectItem value="rounded-xl" className="text-foreground">X-Large (12px)</SelectItem>
            <SelectItem value="rounded-2xl" className="text-foreground">2X-Large (16px)</SelectItem>
            <SelectItem value="rounded-3xl" className="text-foreground">3X-Large (24px)</SelectItem>
            <SelectItem value="rounded-full" className="text-foreground">Full (pill)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Card Gap/Spacing */}
      <div className="space-y-2">
        <Label className="text-foreground">Spacing Between Cards</Label>
        <Select value={cardGap} onValueChange={setCardGap}>
          <SelectTrigger className="bg-background text-foreground border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="gap-2" className="text-foreground">Tight (8px)</SelectItem>
            <SelectItem value="gap-4" className="text-foreground">Compact (16px)</SelectItem>
            <SelectItem value="gap-6" className="text-foreground">Normal (24px)</SelectItem>
            <SelectItem value="gap-8" className="text-foreground">Relaxed (32px)</SelectItem>
            <SelectItem value="gap-12" className="text-foreground">Loose (48px)</SelectItem>
            <SelectItem value="gap-16" className="text-foreground">Extra Loose (64px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visual Preview */}
      <div className="space-y-2 mt-4">
        <Label className="text-foreground">Preview</Label>
        <div className={cn('flex items-center justify-center p-4 bg-muted/30 rounded-lg', cardGap)}>
          <div className={cn(
            cardWidth,
            cardHeight,
            cardBorderRadius,
            'bg-card border border-border flex items-center justify-center text-sm text-foreground'
          )}>
            Card Preview
          </div>
        </div>
      </div>
    </div>
  );
}
