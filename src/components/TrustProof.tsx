import { Star, TrendingUp, Award, Users, Target, Zap, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { EditableTranslation } from "@/components/EditableTranslation";
import { LockedText } from "@/components/LockedText";

const testimonials = [
  {
    name: "Henrik",
    comment: "Kjempebra service!",
    rating: 5
  },
  {
    name: "Emy Marie",
    comment: "6 stjerner til tekniker! Meget hjelpsom!",
    rating: 5
  },
  {
    name: "Lars",
    comment: "Veldig hyggelig og hjelpsom mann!",
    rating: 5
  }
];

export default function TrustProof() {
  const { t } = useAppTranslation();

  const npsCategories = [
    { label: t('trust_proof.nps.category_1.label', 'Overall'), score: 90 },
    { label: t('trust_proof.nps.category_2.label', 'Communication'), score: 92.8 },
    { label: t('trust_proof.nps.category_3.label', 'Ease of use'), score: 91.1 },
    { label: t('trust_proof.nps.category_4.label', 'Politeness'), score: 94.8 }
  ];

  const tractionMetrics = [
    {
      icon: CheckCircle2,
      value: t('trust_proof.metric_1.value', '20,000+'),
      label: t('trust_proof.metric_1.label', 'Bookings completed — and growing'),
      description: t('trust_proof.metric_1.description', 'Proven platform with real commercial success')
    },
    {
      icon: Users,
      value: t('trust_proof.metric_2.value', '4'),
      label: t('trust_proof.metric_2.label', 'Paying SaaS Partners'),
      description: t('trust_proof.metric_2.description', 'Take-rate per booking model validated')
    },
    {
      icon: TrendingUp,
      value: t('trust_proof.metric_3.value', '>49%'),
      label: t('trust_proof.metric_3.label', 'Annual Market Growth'),
      description: t('trust_proof.metric_3.description', 'Convenience services exploding')
    },
    {
      icon: Target,
      value: t('trust_proof.metric_4.value', '€65B'),
      label: t('trust_proof.metric_4.label', 'Addressable Market'),
      description: t('trust_proof.metric_4.description', 'Massive expansion opportunity')
    }
  ];
  return (
    <section className="py-section">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <EditableTranslation translationKey="trust_proof.title">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              {t('trust_proof.title', 'Trusted by Service Professionals')}
            </h2>
          </EditableTranslation>
          <EditableTranslation translationKey="trust_proof.subtitle">
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('trust_proof.subtitle', 'Real results from real businesses—proven traction and customer satisfaction')}
            </p>
          </EditableTranslation>
        </div>

        {/* Traction Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tractionMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="bg-gradient-hero border-0 hover-scale">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4 shadow-lg">
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <EditableTranslation translationKey={`trust_proof.metric_${index + 1}.value`}>
                    <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                      {metric.value}
                    </div>
                  </EditableTranslation>
                  <EditableTranslation translationKey={`trust_proof.metric_${index + 1}.label`}>
                    <div className="text-sm font-semibold text-white/90 mb-2">{metric.label}</div>
                  </EditableTranslation>
                  <EditableTranslation translationKey={`trust_proof.metric_${index + 1}.description`}>
                    <div className="text-xs text-white/70">{metric.description}</div>
                  </EditableTranslation>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* NPS Score Display */}
          <Card className="bg-gradient-hero border-0">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-background/90 backdrop-blur-sm mb-4 shadow-lg">
                  <div>
                    <EditableTranslation translationKey="trust_proof.nps.value">
                      <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        {t('trust_proof.nps.value', '~90')}
                      </div>
                    </EditableTranslation>
                    <EditableTranslation translationKey="trust_proof.nps.label">
                      <div className="text-sm font-medium text-muted-foreground">{t('trust_proof.nps.label', 'NPS Score')}</div>
                    </EditableTranslation>
                  </div>
                </div>
                <EditableTranslation translationKey="trust_proof.nps.title">
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {t('trust_proof.nps.title', 'Industry-Leading Customer Satisfaction')}
                  </h3>
                </EditableTranslation>
                <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg mb-6">
                  <EditableTranslation translationKey="trust_proof.nps.callout">
                    <p className="text-sm font-medium text-primary">{t('trust_proof.nps.callout', '3x better than industry average (20-30)')}</p>
                  </EditableTranslation>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {npsCategories.map((category, index) => (
                    <div key={index} className="bg-background/50 backdrop-blur-sm rounded-lg p-4">
                      <LockedText reason="Metric value from database">
                        <div className="text-2xl font-bold text-primary">{category.score}</div>
                      </LockedText>
                      <EditableTranslation translationKey={`trust_proof.nps.category_${index + 1}.label`}>
                        <div className="text-sm text-muted-foreground">{category.label}</div>
                      </EditableTranslation>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Stats */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <EditableTranslation translationKey="trust_proof.conversion.value">
                    <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {t('trust_proof.conversion.value', '40%')}
                    </div>
                  </EditableTranslation>
                  <EditableTranslation translationKey="trust_proof.conversion.label">
                    <div className="text-sm text-muted-foreground">{t('trust_proof.conversion.label', 'Conversion Rate')}</div>
                  </EditableTranslation>
                </div>
              </div>
              <EditableTranslation translationKey="trust_proof.conversion.description">
                <p className="text-muted-foreground mb-6">
                  {t('trust_proof.conversion.description', 'Our optimized 6-step booking funnel delivers industry-leading conversion rates, turning more visitors into customers.')}
                </p>
              </EditableTranslation>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <EditableTranslation translationKey="trust_proof.conversion.stat_1.label">
                    <span className="text-sm text-muted-foreground">{t('trust_proof.conversion.stat_1.label', 'Step completion rate')}</span>
                  </EditableTranslation>
                  <EditableTranslation translationKey="trust_proof.conversion.stat_1.value">
                    <span className="text-sm font-semibold text-foreground">{t('trust_proof.conversion.stat_1.value', '90%+')}</span>
                  </EditableTranslation>
                </div>
                <div className="flex justify-between items-center">
                  <EditableTranslation translationKey="trust_proof.conversion.stat_2.label">
                    <span className="text-sm text-muted-foreground">{t('trust_proof.conversion.stat_2.label', 'Customer return rate')}</span>
                  </EditableTranslation>
                  <EditableTranslation translationKey="trust_proof.conversion.stat_2.value">
                    <span className="text-sm font-semibold text-foreground">{t('trust_proof.conversion.stat_2.value', '77.9%')}</span>
                  </EditableTranslation>
                </div>
                <div className="flex justify-between items-center">
                  <EditableTranslation translationKey="trust_proof.conversion.stat_3.label">
                    <span className="text-sm text-muted-foreground">{t('trust_proof.conversion.stat_3.label', 'Booking abandonment')}</span>
                  </EditableTranslation>
                  <EditableTranslation translationKey="trust_proof.conversion.stat_3.value">
                    <span className="text-sm font-semibold text-foreground">{t('trust_proof.conversion.stat_3.value', '<10%')}</span>
                  </EditableTranslation>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <div>
          <EditableTranslation translationKey="trust_proof.testimonials.title">
            <h3 className="text-2xl font-bold text-center mb-6 text-foreground">{t('trust_proof.testimonials.title', 'What Customers Say')}</h3>
          </EditableTranslation>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-scale">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <LockedText reason="Hard-coded testimonial - Update in code">
                    <p className="text-foreground mb-3 italic">"{testimonial.comment}"</p>
                  </LockedText>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                      <LockedText reason="Hard-coded testimonial - Update in code">
                        <span className="text-sm font-semibold text-primary-foreground">
                          {testimonial.name[0]}
                        </span>
                      </LockedText>
                    </div>
                    <LockedText reason="Hard-coded testimonial - Update in code">
                      <span className="text-sm font-medium text-foreground">{testimonial.name}</span>
                    </LockedText>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
