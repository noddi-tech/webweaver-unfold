const Metrics = () => {
  const metrics = [
    {
      value: "500+",
      label: "Active Providers",
      description: "Maintenance providers using our platform"
    },
    {
      value: "98%",
      label: "Uptime",
      description: "Reliable platform performance"
    },
    {
      value: "45%",
      label: "Cost Reduction",
      description: "Average operational savings"
    },
    {
      value: "24/7",
      label: "Support",
      description: "Always here when you need us"
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {metric.value}
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">
                {metric.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {metric.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metrics;