import type React from "react";
import type { SlideMode } from "../types";
import type { DeckAccent, Density } from "../visuals/_brand";

export interface DeckComponentProps {
  density?: Density;
  mode?: SlideMode;
  accent?: DeckAccent;
  className?: string;
}

export interface MetricItem {
  label: string;
  value: string;
  context?: string;
  trend?: string;
  accent?: DeckAccent;
}

export interface TextPair {
  label?: string;
  title: string;
  description: string;
  metric?: string;
  accent?: DeckAccent;
}

export interface LogoItem {
  name: string;
  logoUrl?: string | null;
  label?: string;
  status?: string;
}

export interface ComparisonColumn {
  key: string;
  label: string;
  accent?: DeckAccent;
}

export interface ComparisonRow {
  label: string;
  values?: Record<string, string>;
  emphasisKey?: string;
  [key: string]: unknown;
}

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
  metric?: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  metric?: string;
  icon?: React.ReactNode;
}

export interface ChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface ChartAnnotation {
  label: string;
  description?: string;
  pointLabel: string;
  align?: "left" | "right";
}

export interface FunnelStage {
  label: string;
  value: string;
  context?: string;
  widthPct: number;
  accent?: DeckAccent;
}

export interface Person {
  name: string;
  role: string;
  bio: string;
  imageUrl?: string | null;
  metric?: string;
}
