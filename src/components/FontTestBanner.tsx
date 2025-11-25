import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FontTestBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [computedFont, setComputedFont] = useState<string>('');

  useEffect(() => {
    // Get the computed font-family from body
    const bodyFont = window.getComputedStyle(document.body).fontFamily;
    setComputedFont(bodyFont);
    console.log('🔤 FontTestBanner - Computed font-family:', bodyFont);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-purple-600 p-4 text-white shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Font Test - Atkinson Hyperlegible Next Verification</p>
          <p className="text-2xl font-bold tracking-wider">Il1O0 - The quick brown fox jumps over the lazy dog</p>
          <p className="text-xs mt-1">Computed font: {computedFont}</p>
          <p className="text-xs">
            In Atkinson Hyperlegible Next: &apos;I&apos;, &apos;l&apos;, &apos;1&apos; should look distinctly different. &apos;O&apos; and &apos;0&apos; should be clearly distinguishable.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
