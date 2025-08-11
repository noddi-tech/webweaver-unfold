import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { icons as lucideIcons } from "lucide-react";

interface MetricItem {
  value: string;
  label: string;
  description?: string | null;
  iconName?: string | null;
  style?: string | null; // 'card' | 'plain'
  align?: string | null; // 'left' | 'center'
  valueSize?: string | null; // 'sm' | 'md' | 'lg' | 'xl'
  emphasis?: string | null; // 'normal' | 'gradient'
  suffix?: string | null;
  showIcon?: boolean | null;
}

const sizeClass: Record<string, string> = {
  sm: "text-3xl",
  md: "text-4xl",
  lg: "text-5xl",
  xl: "text-6xl",
};

const Metrics = () => {
  const [metrics, setMetrics] = useState<MetricItem[]>([]);

  useEffect(() => {
    const loadMetrics = async () => {
      const { data, error } = await (supabase.from("usps") as any)
        .select("title, metric_value, metric_description, icon_name, metric_style, metric_align, metric_value_size, metric_emphasis, metric_suffix, metric_show_icon")
        .eq("active", true)
        .eq("location", "metrics")
        .eq("format", "metric")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        const mapped: MetricItem[] = (data as any[]).map((d) => ({
          value: d.metric_value || "",
          label: d.title || "",
          description: d.metric_description || null,
          iconName: d.icon_name || null,
          style: d.metric_style || "card",
          align: d.metric_align || "center",
          valueSize: d.metric_value_size || "xl",
          emphasis: d.metric_emphasis || "gradient",
          suffix: d.metric_suffix || null,
          showIcon: typeof d.metric_show_icon === 'boolean' ? d.metric_show_icon : true,
        }));
        setMetrics(mapped);
      }
    };
    loadMetrics();
  }, []);

  const displayMetrics: MetricItem[] = metrics.length > 0 ? metrics : [
    { value: "500+", label: "Active Providers", description: "Maintenance providers using our platform", iconName: "Users", style: "card", align: "center", valueSize: "xl", emphasis: "gradient", suffix: "+", showIcon: true },
    { value: "98%", label: "Uptime", description: "Reliable platform performance", iconName: "Activity", style: "card", align: "center", valueSize: "xl", emphasis: "gradient", suffix: "%", showIcon: true },
    { value: "45%", label: "Cost Reduction", description: "Average operational savings", iconName: "TrendingDown", style: "card", align: "center", valueSize: "xl", emphasis: "gradient", suffix: "%", showIcon: true },
    { value: "24/7", label: "Support", description: "Always here when you need us", iconName: "Clock", style: "card", align: "center", valueSize: "xl", emphasis: "gradient", suffix: "", showIcon: true },
  ];

  return (
    <section className="py-20 px-6" aria-labelledby="metrics-heading">
      <div className="container mx-auto">
        <h2 id="metrics-heading" className="sr-only">Key platform metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {displayMetrics.map((m, index) => {
            const alignClass = m.align === 'left' ? 'text-left' : 'text-center';
            const valueCls = `${sizeClass[m.valueSize || 'xl'] || 'text-6xl'} font-bold ${m.emphasis === 'gradient' ? 'gradient-text' : ''} mb-2 flex items-baseline ${m.align === 'left' ? 'justify-start' : 'justify-center'} gap-1`;
            const containerBase = m.style === 'plain' ? '' : 'bg-card rounded-xl p-6 border border-border shadow-sm';
            const IconCmp = m.iconName ? (lucideIcons as Record<string, any>)[m.iconName] : null;
            return (
              <div key={index} className={`${alignClass} ${containerBase}`}>
                {m.showIcon && IconCmp ? <IconCmp className="w-6 h-6 text-primary mb-2" /> : null}
                <div className={valueCls}>
                  <span>{m.value}</span>
                  {m.suffix ? <span className="text-lg text-muted-foreground">{m.suffix}</span> : null}
                </div>
                <div className="text-lg font-semibold text-foreground mb-1">
                  {m.label}
                </div>
                {m.description ? (
                  <div className="text-sm text-muted-foreground">
                    {m.description}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Metrics;