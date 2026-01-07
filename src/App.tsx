import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageRedirect } from "./components/LanguageRedirect";
import { LanguageSync } from "./components/LanguageSync";
import { TranslationProvider } from "./components/TranslationProvider";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { SiteStylesProvider } from "@/contexts/SiteStylesContext";
import { useTypographySettings } from "@/hooks/useTypographySettings";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import FeaturesPage from "./pages/Features";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import PricingDetailed from "./pages/PricingDetailed";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import Team from "./pages/Team";
import LlmsTxt from "./pages/LlmsTxt";
import Functions from "./pages/Functions";
import Partners from "./pages/Partners";
import Architecture from "./pages/Architecture";
import Solutions from "./pages/Solutions";
import SolutionDetail from "./pages/SolutionDetail";
import Stories from "./pages/Stories";
import CustomerStory from "./pages/CustomerStory";
import AboutUs from "./pages/AboutUs";
import Newsroom from "./pages/Newsroom";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import JobListing from "./pages/JobListing";

const queryClient = new QueryClient();

const App = () => {
  // Load and apply typography settings from database
  useTypographySettings();
  
  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TranslationProvider>
        <SiteStylesProvider>
          <EditModeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
          <Routes>
            {/* Language-prefixed routes */}
            <Route path="/:lang" element={<LanguageSync><Index /></LanguageSync>} />
            <Route path="/:lang/functions" element={<LanguageSync><Functions /></LanguageSync>} />
            <Route path="/:lang/features" element={<LanguageSync><FeaturesPage /></LanguageSync>} />
            <Route path="/:lang/solutions" element={<LanguageSync><Solutions /></LanguageSync>} />
            <Route path="/:lang/solutions/:slug" element={<LanguageSync><SolutionDetail /></LanguageSync>} />
            <Route path="/:lang/stories" element={<LanguageSync><Stories /></LanguageSync>} />
            <Route path="/:lang/stories/:slug" element={<LanguageSync><CustomerStory /></LanguageSync>} />
            <Route path="/:lang/partners" element={<LanguageSync><Partners /></LanguageSync>} />
            <Route path="/:lang/architecture" element={<LanguageSync><Architecture /></LanguageSync>} />
            <Route path="/:lang/pricing" element={<LanguageSync><Pricing /></LanguageSync>} />
            <Route path="/:lang/pricing_detailed" element={<LanguageSync><PricingDetailed /></LanguageSync>} />
            <Route path="/:lang/contact" element={<LanguageSync><Contact /></LanguageSync>} />
            <Route path="/:lang/demo" element={<LanguageSync><Demo /></LanguageSync>} />
            <Route path="/:lang/team" element={<LanguageSync><Team /></LanguageSync>} />
            <Route path="/:lang/about-us" element={<LanguageSync><AboutUs /></LanguageSync>} />
            <Route path="/:lang/newsroom" element={<LanguageSync><Newsroom /></LanguageSync>} />
            <Route path="/:lang/careers" element={<LanguageSync><Careers /></LanguageSync>} />
            <Route path="/:lang/careers/:slug" element={<LanguageSync><JobListing /></LanguageSync>} />
            <Route path="/:lang/blog" element={<LanguageSync><Blog /></LanguageSync>} />
            <Route path="/:lang/blog/:slug" element={<LanguageSync><BlogPost /></LanguageSync>} />
            
            {/* CMS and special routes (no language prefix) */}
            <Route path="/cms-login" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/cms" element={<Admin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/cms/translations" element={<Navigate to="/cms" replace />} />
            <Route path="/llms.txt" element={<LlmsTxt />} />
            
            {/* Redirect root to default language */}
            <Route path="/" element={<LanguageRedirect />} />
            
            {/* Redirect all non-prefixed routes to language-prefixed versions */}
            <Route path="/functions" element={<LanguageRedirect />} />
            <Route path="/features" element={<LanguageRedirect />} />
            <Route path="/solutions" element={<LanguageRedirect />} />
            <Route path="/solutions/:slug" element={<LanguageRedirect />} />
            <Route path="/stories" element={<LanguageRedirect />} />
            <Route path="/stories/:slug" element={<LanguageRedirect />} />
            <Route path="/partners" element={<LanguageRedirect />} />
            <Route path="/architecture" element={<LanguageRedirect />} />
            <Route path="/pricing" element={<LanguageRedirect />} />
            <Route path="/pricing_detailed" element={<LanguageRedirect />} />
            <Route path="/contact" element={<LanguageRedirect />} />
            <Route path="/demo" element={<LanguageRedirect />} />
            <Route path="/team" element={<LanguageRedirect />} />
            <Route path="/about-us" element={<LanguageRedirect />} />
            <Route path="/newsroom" element={<LanguageRedirect />} />
            <Route path="/careers" element={<LanguageRedirect />} />
            <Route path="/careers/:slug" element={<LanguageRedirect />} />
            <Route path="/blog" element={<LanguageRedirect />} />
            <Route path="/blog/:slug" element={<LanguageRedirect />} />
            
            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
          </EditModeProvider>
        </SiteStylesProvider>
      </TranslationProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
