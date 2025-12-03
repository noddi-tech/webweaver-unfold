import { useEffect, useState } from 'react';
import { translationsReadyPromise, isTranslationsReady } from '@/i18n/config';

interface TranslationProviderProps {
  children: React.ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [ready, setReady] = useState(isTranslationsReady());

  useEffect(() => {
    if (!ready) {
      translationsReadyPromise.then(() => {
        setReady(true);
      });
    }
  }, [ready]);

  // Show minimal loading state while translations load
  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
