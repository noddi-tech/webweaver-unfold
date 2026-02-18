import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Save, Eye, EyeOff, Trash2, FileText, Calendar } from "lucide-react";
import BlogRichTextEditor from "./BlogRichTextEditor";

type DocumentType = "privacy_policy" | "terms_of_service" | "cookie_policy" | "data_processor_agreement";

interface LegalDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  version_label: string | null;
  effective_date: string | null;
  last_updated: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const DOC_TYPES: { key: DocumentType; label: string; versioned: boolean }[] = [
  { key: "privacy_policy", label: "Privacy Policy", versioned: true },
  { key: "terms_of_service", label: "Terms of Service", versioned: true },
  { key: "cookie_policy", label: "Cookie Policy", versioned: false },
  { key: "data_processor_agreement", label: "DPA", versioned: false },
];

const LegalDocumentsManager = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);

  const loadDocuments = useCallback(async () => {
    const { data, error } = await supabase
      .from("legal_documents")
      .select("*")
      .order("document_type")
      .order("sort_order", { ascending: false });
    if (error) {
      toast({ title: "Error loading documents", description: error.message, variant: "destructive" });
    } else {
      setDocuments((data as any[]) || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const getDocsForType = (type: DocumentType) =>
    documents.filter((d) => d.document_type === type);

  const handleSave = async (doc: LegalDocument) => {
    setSaving(true);
    const { error } = await supabase
      .from("legal_documents")
      .update({
        title: doc.title,
        content: doc.content,
        version_label: doc.version_label,
        effective_date: doc.effective_date,
        last_updated: doc.last_updated,
        published: doc.published,
      } as any)
      .eq("id", doc.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved" });
      loadDocuments();
    }
  };

  const handlePublish = async (doc: LegalDocument) => {
    // Unpublish all others of same type first
    await supabase
      .from("legal_documents")
      .update({ published: false } as any)
      .eq("document_type", doc.document_type);
    // Publish this one
    await supabase
      .from("legal_documents")
      .update({ published: true } as any)
      .eq("id", doc.id);
    toast({ title: "Published" });
    loadDocuments();
  };

  const handleUnpublish = async (doc: LegalDocument) => {
    await supabase
      .from("legal_documents")
      .update({ published: false } as any)
      .eq("id", doc.id);
    toast({ title: "Unpublished" });
    loadDocuments();
  };

  const handleAddVersion = async (type: DocumentType) => {
    const existing = getDocsForType(type);
    const nextOrder = existing.length;
    const { error } = await supabase.from("legal_documents").insert({
      document_type: type,
      title: DOC_TYPES.find((d) => d.key === type)?.label || "Legal Document",
      content: "",
      version_label: `v${nextOrder + 1}.0`,
      effective_date: new Date().toISOString().split("T")[0],
      last_updated: new Date().toISOString(),
      published: false,
      sort_order: nextOrder,
    } as any);
    if (error) {
      toast({ title: "Error creating version", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "New version created" });
      loadDocuments();
    }
  };

  const handleDelete = async (doc: LegalDocument) => {
    if (!confirm("Delete this version?")) return;
    await supabase.from("legal_documents").delete().eq("id", doc.id);
    toast({ title: "Deleted" });
    if (editingDoc?.id === doc.id) setEditingDoc(null);
    loadDocuments();
  };

  const renderEditor = (doc: LegalDocument) => (
    <Card key={doc.id} className="border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{doc.version_label || "Draft"}</CardTitle>
            {doc.published ? (
              <Badge className="bg-primary text-primary-foreground">Published</Badge>
            ) : (
              <Badge variant="secondary">Draft</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {doc.published ? (
              <Button size="sm" variant="outline" onClick={() => handleUnpublish(doc)}>
                <EyeOff className="h-3 w-3 mr-1" /> Unpublish
              </Button>
            ) : (
              <Button size="sm" variant="default" onClick={() => handlePublish(doc)}>
                <Eye className="h-3 w-3 mr-1" /> Publish
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(doc)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {doc.effective_date && (
          <CardDescription className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Effective: {new Date(doc.effective_date).toLocaleDateString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {editingDoc?.id === doc.id ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Version Label</Label>
                <Input
                  value={editingDoc.version_label || ""}
                  onChange={(e) => setEditingDoc({ ...editingDoc, version_label: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={editingDoc.effective_date || ""}
                  onChange={(e) => setEditingDoc({ ...editingDoc, effective_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Updated</Label>
                <Input
                  type="date"
                  value={editingDoc.last_updated ? editingDoc.last_updated.split("T")[0] : ""}
                  onChange={(e) =>
                    setEditingDoc({
                      ...editingDoc,
                      last_updated: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Content (Markdown)</Label>
              <BlogRichTextEditor
                value={editingDoc.content}
                onChange={(val) => setEditingDoc({ ...editingDoc, content: val })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { handleSave(editingDoc); setEditingDoc(null); }} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
              <Button variant="outline" onClick={() => setEditingDoc(null)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditingDoc({ ...doc })}>
            Edit Content
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderVersionedTab = (type: DocumentType) => {
    const docs = getDocsForType(type);
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {docs.length} version{docs.length !== 1 ? "s" : ""} — only the published version is visible to visitors.
          </p>
          <Button size="sm" onClick={() => handleAddVersion(type)}>
            <Plus className="h-4 w-4 mr-1" /> New Version
          </Button>
        </div>
        {docs.map(renderEditor)}
      </div>
    );
  };

  const renderSingleTab = (type: DocumentType) => {
    const docs = getDocsForType(type);
    const doc = docs[0];
    if (!doc) return <p className="text-muted-foreground">No document found.</p>;
    return renderEditor(doc);
  };

  if (loading) return <p className="text-muted-foreground">Loading legal documents…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Legal Documents</h2>
        <p className="text-muted-foreground">
          Manage your Privacy Policy, Terms of Service, Cookie Policy, and Data Processor Agreement.
        </p>
      </div>

      <Tabs defaultValue="privacy_policy">
        <TabsList className="flex flex-wrap gap-2 mb-6">
          {DOC_TYPES.map((dt) => (
            <TabsTrigger key={dt.key} value={dt.key}>
              {dt.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {DOC_TYPES.map((dt) => (
          <TabsContent key={dt.key} value={dt.key}>
            {dt.versioned ? renderVersionedTab(dt.key) : renderSingleTab(dt.key)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default LegalDocumentsManager;
