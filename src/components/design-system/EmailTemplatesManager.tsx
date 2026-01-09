import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Eye, Send, Mail, Loader2 } from "lucide-react";

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  description: string | null;
  subject: string;
  heading: string;
  body_html: string;
  button_text: string | null;
  button_url: string | null;
  emoji: string;
  header_bg_start: string;
  header_bg_end: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TEMPLATE_VARIABLES = [
  { key: "{{applicant_name}}", label: "Applicant Name" },
  { key: "{{job_title}}", label: "Job Title" },
  { key: "{{site_url}}", label: "Site URL" },
  { key: "{{current_year}}", label: "Current Year" },
];

export function EmailTemplatesManager() {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({});
  const [isSendingTest, setIsSendingTest] = useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("template_key");
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (template: Partial<EmailTemplate> & { id: string }) => {
      const { id, ...updates } = template;
      const { error } = await supabase
        .from("email_templates")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      setEditingTemplate(null);
      toast.success("Email template updated");
    },
    onError: (error) => {
      toast.error("Failed to update template: " + error.message);
    },
  });

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData(template);
  };

  const handleSave = () => {
    if (!editingTemplate || !formData) return;
    updateMutation.mutate({ id: editingTemplate.id, ...formData });
  };

  const insertVariable = (variable: string, field: "subject" | "heading" | "body_html" | "button_url") => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || "") + variable,
    }));
  };

  const handleSendTest = async () => {
    if (!editingTemplate) return;
    
    setIsSendingTest(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("You must be logged in to send test emails");
        return;
      }

      // Use confirmation endpoint for testing with current form data
      const { error } = await supabase.functions.invoke("send-application-confirmation", {
        body: {
          applicantName: "Test User",
          applicantEmail: user.email,
          jobTitle: "Test Position",
          applicationId: "test-123",
          templateOverride: formData,
        },
      });

      if (error) throw error;
      toast.success(`Test email sent to ${user.email}`);
    } catch (error: any) {
      toast.error("Failed to send test email: " + error.message);
    } finally {
      setIsSendingTest(false);
    }
  };

  const renderPreview = (template: EmailTemplate) => {
    const vars: Record<string, string> = {
      "{{applicant_name}}": "John Doe",
      "{{job_title}}": "Fullstack Developer",
      "{{site_url}}": "https://navio.no",
      "{{current_year}}": new Date().getFullYear().toString(),
    };

    const replaceVars = (text: string) =>
      Object.entries(vars).reduce(
        (result, [key, value]) => result.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value),
        text
      );

    return (
      <div className="bg-muted rounded-lg overflow-hidden max-w-lg mx-auto">
        <div
          className="p-6 text-center"
          style={{
            background: `linear-gradient(135deg, ${template.header_bg_start} 0%, ${template.header_bg_end} 100%)`,
          }}
        >
          <h1 className="text-white text-xl font-bold">{replaceVars(template.heading)}</h1>
        </div>
        <div className="bg-background p-6 border border-t-0 rounded-b-lg">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: replaceVars(template.body_html) }}
          />
          {template.button_text && (
            <div className="text-center mt-6">
              <Button
                style={{
                  background: `linear-gradient(135deg, ${template.header_bg_start} 0%, ${template.header_bg_end} 100%)`,
                }}
              >
                {template.button_text}
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center mt-6">
            © {new Date().getFullYear()} Navio. All rights reserved.
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Email Templates</h2>
      </div>
      <p className="text-muted-foreground">
        Customize the email notifications sent to job applicants. Use variables like{" "}
        <code className="bg-muted px-1 rounded">{"{{applicant_name}}"}</code> for dynamic content.
      </p>

      <div className="grid gap-4">
        {templates?.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.emoji}</span>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {template.name}
                      {!template.is_active && (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Preview: {template.name}</DialogTitle>
                      </DialogHeader>
                      {renderPreview(template)}
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={editingTemplate?.id === template.id}
                    onOpenChange={(open) => !open && setEditingTemplate(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(template)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit: {template.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={formData.is_active ?? true}
                              onCheckedChange={(checked) =>
                                setFormData((prev) => ({ ...prev, is_active: checked }))
                              }
                            />
                            <Label>Active</Label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Emoji</Label>
                            <Input
                              value={formData.emoji || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, emoji: e.target.value }))
                              }
                              className="w-20"
                            />
                          </div>
                          <div className="space-y-2 flex gap-4">
                            <div>
                              <Label>Header Start Color</Label>
                              <Input
                                type="color"
                                value={formData.header_bg_start || "#667eea"}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    header_bg_start: e.target.value,
                                  }))
                                }
                                className="w-16 h-10 p-1"
                              />
                            </div>
                            <div>
                              <Label>Header End Color</Label>
                              <Input
                                type="color"
                                value={formData.header_bg_end || "#764ba2"}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    header_bg_end: e.target.value,
                                  }))
                                }
                                className="w-16 h-10 p-1"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Subject Line</Label>
                          <Input
                            value={formData.subject || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, subject: e.target.value }))
                            }
                          />
                          <div className="flex flex-wrap gap-1">
                            {TEMPLATE_VARIABLES.map((v) => (
                              <Button
                                key={v.key}
                                variant="outline"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => insertVariable(v.key, "subject")}
                              >
                                {v.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Heading</Label>
                          <Input
                            value={formData.heading || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, heading: e.target.value }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Body (HTML)</Label>
                          <Textarea
                            value={formData.body_html || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, body_html: e.target.value }))
                            }
                            rows={10}
                            className="font-mono text-sm"
                          />
                          <div className="flex flex-wrap gap-1">
                            {TEMPLATE_VARIABLES.map((v) => (
                              <Button
                                key={v.key}
                                variant="outline"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => insertVariable(v.key, "body_html")}
                              >
                                {v.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Button Text</Label>
                            <Input
                              value={formData.button_text || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  button_text: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Button URL</Label>
                            <Input
                              value={formData.button_url || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  button_url: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={handleSendTest}
                            disabled={isSendingTest}
                          >
                            {isSendingTest ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Send Test Email
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingTemplate(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSave}
                              disabled={updateMutation.isPending}
                            >
                              {updateMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              )}
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground font-mono">
                Subject: {template.subject}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
