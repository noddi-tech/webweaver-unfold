import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import WizardStepEnglish from './WizardStepEnglish';
import WizardStepSync from './WizardStepSync';
import WizardStepTranslate from './WizardStepTranslate';
import WizardStepEvaluate from './WizardStepEvaluate';
import WizardStepApprove from './WizardStepApprove';
import { useWizardStats } from '@/hooks/useWizardStats';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
  isBlocked?: boolean;
}

export default function TranslationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const { stats, loading, refresh } = useWizardStats();

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'English Source',
      description: 'Ensure all English content is complete',
      isComplete: stats.englishComplete,
    },
    {
      id: 2,
      title: 'Sync Keys',
      description: 'Create translation entries for all languages',
      isComplete: stats.syncComplete,
      isBlocked: !stats.englishComplete,
    },
    {
      id: 3,
      title: 'Translate',
      description: 'Translate missing content to all languages',
      isComplete: stats.translationComplete,
      isBlocked: !stats.syncComplete,
    },
    {
      id: 4,
      title: 'Evaluate',
      description: 'Check translation quality with AI',
      isComplete: stats.evaluationComplete,
      isBlocked: !stats.translationComplete,
    },
    {
      id: 5,
      title: 'Approve',
      description: 'Review and publish translations',
      isComplete: stats.approvalComplete,
      isBlocked: !stats.evaluationComplete,
    },
  ];

  const overallProgress = Math.round(
    (steps.filter(s => s.isComplete).length / steps.length) * 100
  );

  const handleStepClick = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (step && !step.isBlocked) {
      setCurrentStep(stepId);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      refresh();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <WizardStepEnglish stats={stats} onComplete={handleNext} />;
      case 2:
        return <WizardStepSync stats={stats} onComplete={handleNext} />;
      case 3:
        return <WizardStepTranslate stats={stats} onComplete={handleNext} />;
      case 4:
        return <WizardStepEvaluate stats={stats} onComplete={handleNext} />;
      case 5:
        return <WizardStepApprove stats={stats} onComplete={refresh} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Translation Wizard
          </h2>
          <p className="text-muted-foreground mt-1">
            Step-by-step guide to complete your translations
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Overall Progress</p>
          <p className="text-3xl font-bold">{overallProgress}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={overallProgress} className="h-3" />

      {/* Step Navigation */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(step.id)}
            disabled={step.isBlocked}
            className={cn(
              "relative p-4 rounded-lg border-2 transition-all text-left",
              currentStep === step.id
                ? "border-primary bg-primary/5"
                : step.isComplete
                ? "border-success bg-success/5"
                : step.isBlocked
                ? "border-muted bg-muted/50 cursor-not-allowed opacity-50"
                : "border-border hover:border-primary/50 cursor-pointer"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {step.isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Circle className={cn(
                  "w-5 h-5",
                  currentStep === step.id ? "text-primary" : "text-muted-foreground"
                )} />
              )}
              <span className="text-sm font-medium">Step {step.id}</span>
            </div>
            <h4 className="font-semibold text-sm">{step.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {steps[currentStep - 1]?.isComplete && (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                )}
                Step {currentStep}: {steps[currentStep - 1]?.title}
              </CardTitle>
              <CardDescription>
                {steps[currentStep - 1]?.description}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={refresh}>
              Refresh Stats
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
