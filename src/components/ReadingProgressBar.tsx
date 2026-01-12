import { useEffect, useState, RefObject } from 'react';

interface ReadingProgressBarProps {
  contentRef: RefObject<HTMLElement>;
  readingTimeMinutes?: number;
}

const ReadingProgressBar = ({ contentRef, readingTimeMinutes }: ReadingProgressBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      if (!contentRef.current) return 0;

      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start: when article top reaches viewport top
      // End: when article bottom reaches viewport center
      const start = element.offsetTop;
      const end = start + rect.height - windowHeight * 0.5;
      const scrollY = window.scrollY;

      const progressValue = ((scrollY - start) / (end - start)) * 100;
      return Math.max(0, Math.min(100, progressValue));
    };

    const handleScroll = () => {
      const newProgress = calculateProgress();
      setProgress(newProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [contentRef]);

  // Calculate remaining time
  const remainingMinutes = readingTimeMinutes 
    ? Math.ceil(readingTimeMinutes * (1 - progress / 100))
    : null;

  // Don't render if no progress
  if (progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] bg-muted/30 z-50"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
      
      {/* Time remaining indicator */}
      {remainingMinutes !== null && (
        <div className="absolute right-4 top-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full border border-border/50 shadow-sm">
          {remainingMinutes > 0 
            ? `${remainingMinutes} min left`
            : '✓ Done'}
        </div>
      )}
    </div>
  );
};

export default ReadingProgressBar;
