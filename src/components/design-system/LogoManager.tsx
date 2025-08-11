import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import IconPicker from "@/components/design-system/IconPicker";
import { icons } from "lucide-react";

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
  logo_image_url: string | null;
  logo_image_height: number;
  logo_icon_name: string | null;
  logo_icon_position: string;
  logo_icon_size: string;
}

const LogoManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<BrandSettingsRow | null>(null);

const [logoText, setLogoText] = useState("");
const [variant, setVariant] = useState("text");
const [gradientToken, setGradientToken] = useState("gradient-primary");
const [textToken, setTextToken] = useState("foreground");
const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
const [logoImageHeight, setLogoImageHeight] = useState(32);
const [showIcon, setShowIcon] = useState(false);
const [iconName, setIconName] = useState<string>("");
const [iconPosition, setIconPosition] = useState("top-right");
const [iconSize, setIconSize] = useState("default");

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
setLogoImageUrl(data.logo_image_url ?? null);
setLogoImageHeight(typeof (data as any).logo_image_height === 'number' ? (data as any).logo_image_height : 32);
setShowIcon(!!(data as any).logo_icon_name);
setIconName((data as any).logo_icon_name ?? "");
setIconPosition((data as any).logo_icon_position ?? "top-right");
setIconSize((data as any).logo_icon_size ?? "default");
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
  logo_image_url: logoImageUrl,
  logo_image_height: logoImageHeight,
  logo_icon_name: showIcon ? iconName : null,
  logo_icon_position: iconPosition,
  logo_icon_size: iconSize,
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
setLogoImageUrl(null);
setLogoImageHeight(32);
setShowIcon(false);
setIconName("");
setIconPosition("top-right");
setIconSize("default");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/svg+xml','image/png','image/jpeg'].includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload SVG, PNG, or JPEG.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${user?.id ?? 'public'}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('brand-logos').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage.from('brand-logos').getPublicUrl(path);
      setLogoImageUrl(pub.publicUrl);
      setVariant('image');
      toast({ title: 'Logo uploaded', description: 'Remember to click Save to apply.' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

const gradientPreviewCls = useMemo(() => gradientClass[gradientToken] ?? "", [gradientToken]);
const textPreviewCls = useMemo(() => textClass[textToken] ?? "text-foreground", [textToken]);
const posClsMap: Record<string, string> = { 'top-right': 'top-0 -translate-y-1/2', 'middle-right': 'top-1/2 -translate-y-1/2', 'bottom-right': 'bottom-0 translate-y-1/2' };
const iconPosCls = useMemo(() => posClsMap[iconPosition] ?? 'top-0 -translate-y-1/2', [iconPosition]);
const iconSizeMap: Record<string, number> = { small: 16, default: 24, medium: 28, large: 32, xl: 40 };
const iconPx = useMemo(() => iconSizeMap[iconSize] ?? 24, [iconSize]);

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
              <p className="text-xs text-muted-foreground">Optional when using an uploaded logo image.</p>
            </div>

            <div className="space-y-2">
              <Label>Variant</Label>
              <Select value={variant} onValueChange={setVariant}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
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

            {variant === 'text' && (
              <div className="space-y-3">
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Accent icon</Label>
                    <p className="text-xs text-muted-foreground">Optional icon placed after the wordmark.</p>
                  </div>
                  <Switch checked={showIcon} onCheckedChange={setShowIcon} />
                </div>
                {showIcon && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <IconPicker value={iconName} onChange={setIconName} />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select value={iconPosition} onValueChange={setIconPosition}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top-right">Top right</SelectItem>
                          <SelectItem value="middle-right">Middle right</SelectItem>
                          <SelectItem value="bottom-right">Bottom right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Select value={iconSize} onValueChange={setIconSize}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="xl">XL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="logo-image">Logo image (SVG/PNG/JPEG)</Label>
              <Input id="logo-image" type="file" accept=".svg,.png,.jpg,.jpeg" onChange={handleFileChange} />
              {logoImageUrl && (
                <p className="text-xs text-muted-foreground break-all">{logoImageUrl}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo-height">Header logo height (px)</Label>
                <Input id="logo-height" type="number" min={16} max={96} step={1} value={logoImageHeight} onChange={(e) => setLogoImageHeight(Number(e.target.value || 0))} />
                <p className="text-xs text-muted-foreground">Controls the image logo size in the header.</p>
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
              {variant === 'image' && logoImageUrl ? (
                <div className="flex items-center">
                  <img src={logoImageUrl} alt="Brand logo image" className="w-auto" style={{ height: logoImageHeight }} loading="lazy" />
                </div>
              ) : (
                <>
<div className={`relative inline-block pr-6 text-5xl font-extrabold tracking-tight ${gradientPreviewCls} bg-clip-text text-transparent`}>
  {logoText || "Your Brand"}
  {showIcon && iconName && (() => { const IconCmp = (icons as Record<string, any>)[iconName]; return IconCmp ? <IconCmp className={`absolute right-0 translate-x-1/4 ${iconPosCls} ${textPreviewCls}`} style={{ width: iconPx, height: iconPx }} /> : null; })()}
</div>
                  <Separator />
                  <div className={`text-5xl font-extrabold tracking-tight ${textPreviewCls}`}>
                    {logoText || "Your Brand"}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LogoManager;
