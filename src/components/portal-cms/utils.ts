import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { VisualConfig } from "@/components/portal-deck/types";

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function formatNok(value: number | null | undefined) {
  if (value == null) return "—";
  return `NOK ${new Intl.NumberFormat("en-US").format(Number(value))}`;
}

export function formatNokM(value: number | null | undefined) {
  if (value == null) return "—";
  return `NOK ${(Number(value) / 1_000_000).toFixed(1)}M`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function formatRelative(value: string | null | undefined) {
  if (!value) return "—";
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function formatDwell(seconds: number | null | undefined) {
  const total = Math.max(0, Number(seconds ?? 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function truncateIp(ip: unknown) {
  if (!ip) return "—";
  const value = String(ip);
  const parts = value.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
  return value.length > 24 ? `${value.slice(0, 24)}…` : value;
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const headers = Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach((key) => set.add(key));
    return set;
  }, new Set<string>()));
  const escape = (value: unknown) => {
    const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csv = [headers.join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function jsonToVisualConfig(value: Json | null): VisualConfig | null {
  return value && typeof value === "object" ? value as VisualConfig : null;
}

export function visualConfigToJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value ?? {})) as Json;
}

export async function uploadPortalImage(file: File, folder: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `portal/${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("site-images").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return supabase.storage.from("site-images").getPublicUrl(path).data.publicUrl;
}
