import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageRedirect } from "./components/LanguageRedirect";
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
import TranslationManager from "./pages/TranslationManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Language-prefixed routes */}
          <Route path="/:lang" element={<Index />} />
          <Route path="/:lang/functions" element={<Functions />} />
          <Route path="/:lang/features" element={<FeaturesPage />} />
          <Route path="/:lang/partners" element={<Partners />} />
          <Route path="/:lang/architecture" element={<Architecture />} />
          <Route path="/:lang/pricing" element={<Pricing />} />
          <Route path="/:lang/contact" element={<Contact />} />
          <Route path="/:lang/demo" element={<Demo />} />
          <Route path="/:lang/team" element={<Team />} />
          
          {/* CMS and special routes (no language prefix) */}
          <Route path="/cms-login" element={<Auth />} />
          <Route path="/cms" element={<Admin />} />
          <Route path="/cms/translations" element={<TranslationManager />} />
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
