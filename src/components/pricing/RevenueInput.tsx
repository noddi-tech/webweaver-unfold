import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatCompactCurrency } from "@/utils/formatCurrency";
import { FormattedNumberInput } from "./FormattedNumberInput";

interface RevenueInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  currency: string;
  tooltip?: string;
}

export function RevenueInput({ label, value, onChange, max, currency, tooltip }: RevenueInputProps) {
  const handleSliderChange = (values: number[]) => {
    onChange(Math.max(0, values[0]));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value) || 0;
    onChange(Math.max(0, Math.min(numValue, max)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor={label} className="text-sm font-medium text-foreground">
            {label.split(' Annual')[0]}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <span className="text-sm font-medium text-primary">
          {formatCompactCurrency(value, currency)}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Slider
            id={label}
            value={[value]}
            onValueChange={handleSliderChange}
            max={max}
            step={10000}
            className="w-full"
            aria-label={label}
          />
        </div>
        
        <FormattedNumberInput
          value={value}
          onChange={(val) => onChange(Math.max(0, Math.min(val, max)))}
          currency={currency}
          max={max}
          className="w-40 text-right"
          aria-label={`${label} input`}
        />
      </div>
      
      <div className="text-xs text-muted-foreground text-right">
        Range: {formatCompactCurrency(0, currency)} – {formatCompactCurrency(max, currency)}
      </div>
    </div>
  );
}
