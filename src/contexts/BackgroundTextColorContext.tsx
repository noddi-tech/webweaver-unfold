import React, { createContext, useContext } from 'react';

interface BackgroundTextColorContextValue {
  inheritedTextColor: string | null;
}

const BackgroundTextColorContext = createContext<BackgroundTextColorContextValue>({
  inheritedTextColor: null,
});

export function useBackgroundTextColor() {
  return useContext(BackgroundTextColorContext);
}

export function BackgroundTextColorProvider({
  children,
  textColor,
}: {
  children: React.ReactNode;
  textColor: string | null;
}) {
  return (
    <BackgroundTextColorContext.Provider value={{ inheritedTextColor: textColor }}>
      {children}
    </BackgroundTextColorContext.Provider>
  );
}
