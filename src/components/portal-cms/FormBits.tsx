import type React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { uploadPortalImage } from "./utils";
import { useState } from "react";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextField({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string }) {
  return <Field label={label}><Input value={value} required={required} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></Field>;
}

export function NumberField({ label, value, onChange, readOnly }: { label: string; value: number | null | undefined; onChange: (value: number) => void; readOnly?: boolean }) {
  return <Field label={label}><Input type="number" value={value ?? 0} readOnly={readOnly} onChange={(event) => onChange(Number(event.target.value))} /></Field>;
}

export function DateField({ label, value, onChange }: { label: string; value: string | null | undefined; onChange: (value: string | null) => void }) {
  return <Field label={label}><Input type="date" value={value ?? ""} onChange={(event) => onChange(event.target.value || null)} /></Field>;
}

export function MarkdownField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <Field label={label}><Textarea className="min-h-44 font-mono text-sm" value={value} onChange={(event) => onChange(event.target.value)} /></Field>;
}

export function ImageUploadField({ label, value, onChange, folder }: { label: string; value: string; onChange: (value: string) => void; folder: string }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadPortalImage(file, folder));
    } finally {
      setUploading(false);
    }
  };
  return (
    <Field label={label}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {value ? <img src={value} alt="Preview" className="h-16 w-16 rounded-md border object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-md border text-xs text-muted-foreground">—</div>}
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Image URL" />
        <Button type="button" variant="outline" disabled={uploading} onClick={() => document.getElementById(`${folder}-upload`)?.click()}>{uploading ? "Uploading…" : "Upload"}</Button>
        <input id={`${folder}-upload`} type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
      </div>
    </Field>
  );
}
