import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="/" element={<Index />} />
          <Route path="/functions" element={<Functions />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/team" element={<Team />} />
          
          <Route path="/cms-login" element={<Auth />} />
          <Route path="/cms" element={<Admin />} />
          <Route path="/llms.txt" element={<LlmsTxt />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
