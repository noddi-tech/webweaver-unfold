import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Metrics = () => {
  const [metrics, setMetrics] = useState<{ value: string; label: string; description?: string }[]>([]);

  useEffect(() => {
    const loadMetrics = async () => {
      const { data, error } = await (supabase.from("usps") as any)
        .select("title, metric_value, metric_description")
        .eq("active", true)
        .eq("location", "metrics")
        .eq("format", "metric")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        const mapped = (data as any[]).map((d) => ({
          value: d.metric_value || "",
          label: d.title || "",
          description: d.metric_description || "",
        }));
        setMetrics(mapped);
      }
    };
    loadMetrics();
  }, []);

  const displayMetrics = metrics.length > 0 ? metrics : [
    { value: "500+", label: "Active Providers", description: "Maintenance providers using our platform" },
    { value: "98%", label: "Uptime", description: "Reliable platform performance" },
    { value: "45%", label: "Cost Reduction", description: "Average operational savings" },
    { value: "24/7", label: "Support", description: "Always here when you need us" },
  ];

  return (
    <section className="py-20 px-6" aria-labelledby="metrics-heading">
      <div className="container mx-auto">
        <h2 id="metrics-heading" className="sr-only">Key platform metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {displayMetrics.map((metric, index) => (
            <div key={index} className="text-center bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {metric.value}
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">
                {metric.label}
              </div>
              {metric.description ? (
                <div className="text-sm text-muted-foreground">
                  {metric.description}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metrics;