import { AlertTriangle, X, CheckCircle2, Zap, Users, Package, TrendingUp, Award, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppTranslation } from "@/hooks/useAppTranslation";

export default function WhyItMatters() {
  const { t } = useAppTranslation();

  const painPoints = [
    {
      icon: Package,
      problem: t('why_it_matters.pain_points.tire_sales.problem', "Tire sales can't be automated"),
      disconnected: t('why_it_matters.pain_points.tire_sales.disconnected', "Manual cross-checking, delays, errors"),
      ourApproach: t('why_it_matters.pain_points.tire_sales.approach', "Fully integrated tire sales tied to inventory & quoting")
    },
    {
      icon: AlertTriangle,
      problem: t('why_it_matters.pain_points.recall.problem', "Poor recall logic"),
      disconnected: t('why_it_matters.pain_points.recall.disconnected', "Static campaigns, low relevance"),
      ourApproach: t('why_it_matters.pain_points.recall.approach', "Recall campaigns driven by capacity, utilization, and data")
    },
    {
      icon: X,
      problem: t('why_it_matters.pain_points.sync.problem', "Sync issues when booking changes"),
      disconnected: t('why_it_matters.pain_points.sync.disconnected', "Broken flows, double bookings"),
      ourApproach: t('why_it_matters.pain_points.sync.approach', "Real-time sync across booking, backend, shop")
    },
    {
      icon: AlertTriangle,
      problem: t('why_it_matters.pain_points.lane.problem', "Lane optimization breaks"),
      disconnected: t('why_it_matters.pain_points.lane.disconnected', "Digital → analog friction upon arrival"),
      ourApproach: t('why_it_matters.pain_points.lane.approach', "Seamless experience from booking to garage floor")
    },
    {
      icon: Users,
      problem: t('why_it_matters.pain_points.contactless.problem', "Contactless visits are limited"),
      disconnected: t('why_it_matters.pain_points.contactless.disconnected', "Need in-person touchpoints"),
      ourApproach: t('why_it_matters.pain_points.contactless.approach', "Fully self-servicable UI with mobile + in-lane support")
    },
    {
      icon: Zap,
      problem: t('why_it_matters.pain_points.splitting.problem', "Splitting across systems"),
      disconnected: t('why_it_matters.pain_points.splitting.disconnected', "Integration complexity + tech dependencies"),
      ourApproach: t('why_it_matters.pain_points.splitting.approach', "We own both booking and ERP — one roadmap, one source of truth")
    }
  ];

  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            {t('why_it_matters.title', 'Why Our Integrated Platform Matters')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('why_it_matters.subtitle', 'When your booking system and ERP speak the same language, everything just works')}
          </p>
        </div>

        <Tabs defaultValue="problem" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-12">
            <TabsTrigger value="problem">{t('why_it_matters.tab_problem', 'The Industry Problem')}</TabsTrigger>
            <TabsTrigger value="opportunity">{t('why_it_matters.tab_opportunity', 'Opportunity & Traction')}</TabsTrigger>
            <TabsTrigger value="advantage">{t('why_it_matters.tab_advantage', 'Integrated Tech Advantage')}</TabsTrigger>
          </TabsList>

          {/* Tab 1: The Industry Problem */}
          <TabsContent value="problem" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4 text-foreground">{t('why_it_matters.problem.title', 'The Car Maintenance Experience Is Broken')}</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('why_it_matters.problem.subtitle', 'Traditional automotive services are failing to meet modern customer expectations')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{t('why_it_matters.problem.card_1.title', 'Inconvenient & Time-Consuming')}</h4>
                    <p className="text-sm text-muted-foreground">{t('why_it_matters.problem.card_1.description', 'Customers waste hours driving to garages, waiting for service, and dealing with manual processes')}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="flex items-start gap-3 mb-3">
                  <X className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{t('why_it_matters.problem.card_2.title', 'Poor Customer Experience')}</h4>
                    <p className="text-sm text-muted-foreground">{t('why_it_matters.problem.card_2.description', 'Hidden fees, lack of transparency, and unreliable communication damage trust and satisfaction')}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="flex items-start gap-3 mb-3">
                  <Zap className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{t('why_it_matters.problem.card_3.title', 'Limited Digital Presence')}</h4>
                    <p className="text-sm text-muted-foreground">{t('why_it_matters.problem.card_3.description', "Most providers aren't digital—still relying on phone calls and manual scheduling")}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="flex items-start gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{t('why_it_matters.problem.card_4.title', 'Industry NPS: 20-30')}</h4>
                    <p className="text-sm text-muted-foreground">{t('why_it_matters.problem.card_4.description', 'Low customer satisfaction scores indicate widespread dissatisfaction with current service models')}</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Opportunity & Traction */}
          <TabsContent value="opportunity" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4 text-foreground">{t('why_it_matters.opportunity.title', 'Convenience Services Are Exploding')}</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('why_it_matters.opportunity.subtitle', 'The market is growing rapidly, and Noddi is leading the transformation')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-hero border-0">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">&gt;49%</div>
                  <p className="text-sm text-white/90">{t('why_it_matters.opportunity.metric_1.label', 'Annual Market Growth')}</p>
                  <p className="text-xs text-white/70 mt-2">{t('why_it_matters.opportunity.metric_1.description', 'Convenience services are the fastest-growing segment')}</p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-hero border-0">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">20,000+</div>
                  <p className="text-sm text-white/90">{t('why_it_matters.opportunity.metric_2.label', 'Bookings Completed — and growing')}</p>
                  <p className="text-xs text-white/70 mt-2">{t('why_it_matters.opportunity.metric_2.description', 'Proven platform with real commercial traction')}</p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-hero border-0">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">NPS ~90</div>
                  <p className="text-sm text-white/90">{t('why_it_matters.opportunity.metric_3.label', 'Customer Satisfaction')}</p>
                  <p className="text-xs text-white/70 mt-2">{t('why_it_matters.opportunity.metric_3.description', '3x better than industry average (20-30)')}</p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-hero border-0">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">4</div>
                  <p className="text-sm text-white/90">{t('why_it_matters.opportunity.metric_4.label', 'Paying SaaS Partners')}</p>
                  <p className="text-xs text-white/70 mt-2">{t('why_it_matters.opportunity.metric_4.description', 'Take-rate per booking model validated')}</p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-hero border-0">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">€65B</div>
                  <p className="text-sm text-white/90">{t('why_it_matters.opportunity.metric_5.label', 'Addressable Market')}</p>
                  <p className="text-xs text-white/70 mt-2">{t('why_it_matters.opportunity.metric_5.description', 'Massive opportunity for platform expansion')}</p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-hero border-0">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">&gt;€200M</div>
                  <p className="text-sm text-white/90">{t('why_it_matters.opportunity.metric_6.label', 'License Revenue Potential')}</p>
                  <p className="text-xs text-white/70 mt-2">{t('why_it_matters.opportunity.metric_6.description', 'Annual recurring revenue opportunity')}</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Integrated Tech Advantage */}
          <TabsContent value="advantage" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4 text-foreground">{t('why_it_matters.advantage.title', 'One Platform. One Source of Truth.')}</h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
                {t('why_it_matters.advantage.description', "Noddi doesn't just provide a booking flow — we offer a fully automated logistics platform that eliminates API sync issues because the ERP backend and booking frontend share the same data model and automation engine")}
              </p>
              <div className="inline-block px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-base font-medium text-primary">
                  {t('why_it_matters.advantage.tagline', 'When your booking system and ERP speak the same language, everything just works.')}
                </p>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground">{t('why_it_matters.advantage.table.problem', 'Problem')}</th>
                    <th className="text-left p-4 font-semibold text-foreground">{t('why_it_matters.advantage.table.disconnected', 'What Happens in Disconnected Systems')}</th>
                    <th className="text-left p-4 font-semibold text-foreground">{t('why_it_matters.advantage.table.approach', "Noddi's Integrated Approach")}</th>
                  </tr>
                </thead>
                <tbody>
                  {painPoints.map((point, index) => {
                    const Icon = point.icon;
                    return (
                      <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="font-medium text-foreground">{point.problem}</span>
                          </div>
                        </td>
                        <td className="p-6 text-muted-foreground">{point.disconnected}</td>
                        <td className="p-6">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{point.ourApproach}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {painPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <Card key={index} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="font-semibold text-foreground">{point.problem}</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{t('why_it_matters.advantage.mobile.disconnected_label', 'Disconnected Systems:')}</p>
                        <p className="text-sm text-foreground">{point.disconnected}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {t('why_it_matters.advantage.mobile.approach_label', "Noddi's Approach:")}
                        </p>
                        <p className="text-sm text-foreground">{point.ourApproach}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
