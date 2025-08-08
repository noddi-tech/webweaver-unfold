import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const gradientClass: Record<string, string> = {
  "gradient-primary": "bg-gradient-primary",
  "gradient-background": "bg-gradient-background",
  "gradient-hero": "bg-gradient-hero",
};

const textClass: Record<string, string> = {
  foreground: "text-foreground",
  "muted-foreground": "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
};

const gradientOptions = ["gradient-primary", "gradient-background", "gradient-hero"];
const textTokenOptions = ["foreground", "muted-foreground", "primary", "secondary", "accent"];

interface BrandSettingsRow {
  id: string;
  logo_text: string | null;
  logo_variant: string;
  gradient_token: string;
  text_token: string;
}

const LogoManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<BrandSettingsRow | null>(null);

  const [logoText, setLogoText] = useState("");
  const [variant, setVariant] = useState("text");
  const [gradientToken, setGradientToken] = useState("gradient-primary");
  const [textToken, setTextToken] = useState("foreground");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("brand_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) {
        toast({ title: "Failed to load", description: error.message, variant: "destructive" });
      }
      if (data) {
        setRow(data as any);
        setLogoText(data.logo_text ?? "");
        setVariant(data.logo_variant ?? "text");
        setGradientToken(data.gradient_token ?? "gradient-primary");
        setTextToken(data.text_token ?? "foreground");
      }
      setLoading(false);
    };
    load();
  }, [toast]);

  const save = async () => {
    const payload = {
      logo_text: logoText,
      logo_variant: variant,
      gradient_token: gradientToken,
      text_token: textToken,
    };
    let error;
    if (row?.id) {
      ({ error } = await supabase.from("brand_settings").update(payload).eq("id", row.id));
    } else {
      const { data, error: insertError } = await supabase.from("brand_settings").insert(payload).select("*").maybeSingle();
      error = insertError;
      if (data) setRow(data as any);
    }
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Brand settings updated." });
      // Broadcast update so the Header updates instantly
      window.dispatchEvent(new CustomEvent('brand_settings_updated', { detail: payload }));
    }
  };

  const resetDefaults = () => {
    setLogoText("");
    setVariant("text");
    setGradientToken("gradient-primary");
    setTextToken("foreground");
  };

  const gradientPreviewCls = useMemo(() => gradientClass[gradientToken] ?? "", [gradientToken]);
  const textPreviewCls = useMemo(() => textClass[textToken] ?? "text-foreground", [textToken]);

  return (
    <section>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Logo</h2>
        <p className="text-muted-foreground">Manage your brand wordmark using existing color tokens and gradients.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo-text">Logo text</Label>
              <Input id="logo-text" value={logoText} onChange={(e) => setLogoText(e.target.value)} placeholder="Noddi Tech" />
            </div>

            <div className="space-y-2">
              <Label>Variant</Label>
              <Select value={variant} onValueChange={setVariant}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gradient token</Label>
                <Select value={gradientToken} onValueChange={setGradientToken}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {gradientOptions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Text token</Label>
                <Select value={textToken} onValueChange={setTextToken}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {textTokenOptions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={save} disabled={loading}>Save</Button>
              <Button variant="secondary" onClick={resetDefaults}>Reset</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className={`text-5xl font-extrabold tracking-tight ${gradientPreviewCls} bg-clip-text text-transparent`}>
                {logoText || "Your Brand"}
              </div>
              <Separator />
              <div className={`text-5xl font-extrabold tracking-tight ${textPreviewCls}`}>
                {logoText || "Your Brand"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LogoManager;
