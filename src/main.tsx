import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'
import { ThemeProvider } from 'next-themes'

// Apply font family from CSS variables immediately
document.body.style.fontFamily = 'var(--font-primary)';

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <App />
  </ThemeProvider>
);

