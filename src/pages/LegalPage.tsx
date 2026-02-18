import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { parseBlogMarkdown } from "@/lib/markdownUtils";
import { LanguageLink } from "@/components/LanguageLink";

interface LegalPageProps {
  documentType: string;
}

interface LegalDoc {
  id: string;
  title: string;
  content: string;
  version_label: string | null;
  effective_date: string | null;
  last_updated: string;
}

const LegalPage = ({ documentType }: LegalPageProps) => {
  const [doc, setDoc] = useState<LegalDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("legal_documents")
        .select("id, title, content, version_label, effective_date, last_updated")
        .eq("document_type", documentType)
        .eq("published", true)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      setDoc(data as any);
      setLoading(false);
    };
    load();
  }, [documentType]);

  useEffect(() => {
    if (doc) document.title = doc.title;
  }, [doc]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20 max-w-3xl">
        {loading ? (
          <p className="text-muted-foreground text-center">Loading…</p>
        ) : !doc ? (
          <p className="text-muted-foreground text-center">Document not found.</p>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-4">{doc.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              {doc.effective_date && (
                <span>Effective: {new Date(doc.effective_date).toLocaleDateString()}</span>
              )}
              {doc.last_updated && (
                <span>Last updated: {new Date(doc.last_updated).toLocaleDateString()}</span>
              )}
              {doc.version_label && <span>{doc.version_label}</span>}
            </div>

            <article
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: parseBlogMarkdown(doc.content) }}
            />

            {documentType === "terms_of_service" && (
              <div className="mt-12 p-6 rounded-lg border bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Our Data Processor Agreement (DPA) is part of these Terms of Service.{" "}
                  <LanguageLink to="/dpa" className="text-primary underline hover:text-primary/80">
                    Read the DPA →
                  </LanguageLink>
                </p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LegalPage;
