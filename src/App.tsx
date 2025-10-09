import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageRedirect } from "./components/LanguageRedirect";
import { LanguageSync } from "./components/LanguageSync";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import FeaturesPage from "./pages/Features";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Team from "./pages/Team";
import LlmsTxt from "./pages/LlmsTxt";
import Functions from "./pages/Functions";
import Partners from "./pages/Partners";
import Architecture from "./pages/Architecture";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Language-prefixed routes */}
          <Route path="/:lang" element={<LanguageSync><Index /></LanguageSync>} />
          <Route path="/:lang/functions" element={<LanguageSync><Functions /></LanguageSync>} />
          <Route path="/:lang/features" element={<LanguageSync><FeaturesPage /></LanguageSync>} />
          <Route path="/:lang/partners" element={<LanguageSync><Partners /></LanguageSync>} />
          <Route path="/:lang/architecture" element={<LanguageSync><Architecture /></LanguageSync>} />
          <Route path="/:lang/pricing" element={<LanguageSync><Pricing /></LanguageSync>} />
          <Route path="/:lang/contact" element={<LanguageSync><Contact /></LanguageSync>} />
          <Route path="/:lang/demo" element={<LanguageSync><Demo /></LanguageSync>} />
          <Route path="/:lang/team" element={<LanguageSync><Team /></LanguageSync>} />
          
          {/* CMS and special routes (no language prefix) */}
          <Route path="/cms-login" element={<Auth />} />
          <Route path="/cms" element={<Admin />} />
          <Route path="/cms/translations" element={<Navigate to="/cms" replace />} />
          <Route path="/llms.txt" element={<LlmsTxt />} />
          
          {/* Redirect root to default language */}
          <Route path="/" element={<LanguageRedirect />} />
          
          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
