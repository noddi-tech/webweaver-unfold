import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DynamicSection from "@/components/DynamicSection";
import { supabase } from '@/integrations/supabase/client';

interface Section {
  id: string;
  name: string;
  display_name: string;
  page_location: string;
  active: boolean;
  sort_order: number;
  background_token?: string;
  text_token?: string;
  padding_token?: string;
  margin_token?: string;
  max_width_token?: string;
}

const Index = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      const { data } = await supabase
        .from('sections')
        .select('*')
        .eq('active', true)
        .in('page_location', ['index', 'homepage'])
        .order('sort_order', { ascending: true });
      
      setSections(data || []);
      setLoading(false);
    };

    fetchSections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen text-foreground">
        <Header />
        <main className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main>
        {sections.map((section) => (
          <DynamicSection key={section.id} section={section} />
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
