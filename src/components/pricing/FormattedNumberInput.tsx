import { Input } from "@/components/ui/input";
import { getCurrencyConfig } from "@/config/pricing";
import { forwardRef, useState, useEffect } from "react";

interface FormattedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  currency: string;
  max?: number;
}

/**
 * A number input that displays formatted currency values with thousands separators.
 * Handles parsing and formatting based on currency locale.
 */
export const FormattedNumberInput = forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  ({ value, onChange, currency, max, className, ...props }, ref) => {
    const config = getCurrencyConfig(currency);
    const [displayValue, setDisplayValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Format number for display
    const formatNumber = (num: number): string => {
      return new Intl.NumberFormat(config.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
    };

    // Update display value when value or currency changes (but not when focused)
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatNumber(value));
      }
    }, [value, currency, isFocused]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Show raw number when focused for easier editing
      setDisplayValue(value.toString());
      e.target.select();
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Reformat on blur
      setDisplayValue(formatNumber(value));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      // Allow only digits
      const cleaned = input.replace(/[^\d]/g, "");
      
      if (cleaned === "") {
        setDisplayValue("");
        onChange(0);
        return;
      }

      const numValue = parseInt(cleaned, 10);
      if (!isNaN(numValue)) {
        const clampedValue = max ? Math.min(numValue, max) : numValue;
        setDisplayValue(cleaned);
        onChange(clampedValue);
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={className}
          {...props}
        />
        {!isFocused && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {config.symbol}
          </div>
        )}
      </div>
    );
  }
);

FormattedNumberInput.displayName = "FormattedNumberInput";
