import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Hydrate saved design tokens and color system before React renders
(function applySavedDesignSystem() {
  try {
    const root = document.documentElement;

    const savedColors = localStorage.getItem('noddi-color-system');
    if (savedColors) {
      const colors = JSON.parse(savedColors) as Array<{ cssVar: string; value: string }>;
      colors.forEach((c) => root.style.setProperty(c.cssVar, c.value));
    }

    const savedTokens = localStorage.getItem('noddi-design-tokens');
    if (savedTokens) {
      const tokens = JSON.parse(savedTokens) as Array<{ name: string; value: string }>;
      tokens.forEach((t) => root.style.setProperty(t.name, t.value));
    }
  } catch (e) {
    console.warn('Design system hydration failed', e);
  }
})();

createRoot(document.getElementById("root")!).render(<App />);

