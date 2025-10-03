import { Button } from "@/components/ui/button";
import { FormattedNumberInput } from "./FormattedNumberInput";
import { Minus, Plus } from "lucide-react";

interface NumericStepperInputProps {
  value: number;
  onChange: (value: number) => void;
  currency: string;
  max: number;
  step?: number;
  className?: string;
}

export function NumericStepperInput({ 
  value, 
  onChange, 
  currency, 
  max, 
  step = 50000,
  className = "" 
}: NumericStepperInputProps) {
  
  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, 0);
    onChange(newValue);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={handleDecrement}
        disabled={value <= 0}
        aria-label="Decrease value"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <FormattedNumberInput
        value={value}
        onChange={(val) => onChange(Math.max(0, Math.min(val, max)))}
        currency={currency}
        max={max}
        className="flex-1 text-center"
      />
      
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="Increase value"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
