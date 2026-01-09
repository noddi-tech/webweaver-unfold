import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Star, Save, Send } from "lucide-react";

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string | null;
  max_score: number;
  weight: number;
  category: string;
}

interface EvaluationFormProps {
  applicationId: string;
  applicantName: string;
  jobTitle: string;
  onComplete?: () => void;
}

const RECOMMENDATION_OPTIONS = [
  { value: "strong_hire", label: "Strong Hire", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  { value: "hire", label: "Hire", color: "text-green-500", bg: "bg-green-50/50 border-green-100" },
  { value: "maybe", label: "Maybe", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  { value: "no_hire", label: "No Hire", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  { value: "strong_no_hire", label: "Strong No", color: "text-red-600", bg: "bg-red-50 border-red-200" },
];

export default function EvaluationForm({ applicationId, applicantName, jobTitle, onComplete }: EvaluationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scores, setScores] = useState<Record<string, { score: number; comment: string }>>({});
  const [recommendation, setRecommendation] = useState<string>("");
  const [strengths, setStrengths] = useState("");
  const [concerns, setConcerns] = useState("");
  const [notes, setNotes] = useState("");
  const [existingEvaluationId, setExistingEvaluationId] = useState<string | null>(null);

  // Fetch evaluation criteria
  const { data: criteria = [], isLoading: criteriaLoading } = useQuery({
    queryKey: ["evaluation-criteria"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_criteria")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data as EvaluationCriteria[];
    },
  });

  // Fetch existing evaluation if any
  const { data: existingEvaluation, isLoading: evalLoading } = useQuery({
    queryKey: ["my-evaluation", applicationId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("candidate_evaluations")
        .select(`
          *,
          evaluation_scores (*)
        `)
        .eq("application_id", applicationId)
        .eq("evaluator_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Load existing evaluation data
  useEffect(() => {
    if (existingEvaluation) {
      setExistingEvaluationId(existingEvaluation.id);
      setRecommendation(existingEvaluation.overall_recommendation || "");
      setStrengths(existingEvaluation.strengths || "");
      setConcerns(existingEvaluation.concerns || "");
      setNotes(existingEvaluation.notes || "");
      
      // Load scores
      const loadedScores: Record<string, { score: number; comment: string }> = {};
      existingEvaluation.evaluation_scores?.forEach((score: any) => {
        loadedScores[score.criteria_id] = {
          score: score.score,
          comment: score.comment || "",
        };
      });
      setScores(loadedScores);
    }
  }, [existingEvaluation]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user's name from profile or email
      const evaluatorName = user.email?.split("@")[0] || "Unknown";

      if (existingEvaluationId) {
        // Update existing evaluation
        const { error: evalError } = await supabase
          .from("candidate_evaluations")
          .update({
            overall_recommendation: recommendation || null,
            notes: notes || null,
            strengths: strengths || null,
            concerns: concerns || null,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existingEvaluationId);

        if (evalError) throw evalError;

        // Delete old scores and insert new ones
        await supabase
          .from("evaluation_scores")
          .delete()
          .eq("evaluation_id", existingEvaluationId);

        const scoreInserts = Object.entries(scores).map(([criteriaId, { score, comment }]) => ({
          evaluation_id: existingEvaluationId,
          criteria_id: criteriaId,
          score,
          comment: comment || null,
        }));

        if (scoreInserts.length > 0) {
          const { error: scoresError } = await supabase
            .from("evaluation_scores")
            .insert(scoreInserts);
          if (scoresError) throw scoresError;
        }
      } else {
        // Create new evaluation
        const { data: evaluation, error: evalError } = await supabase
          .from("candidate_evaluations")
          .insert({
            application_id: applicationId,
            evaluator_id: user.id,
            evaluator_name: evaluatorName,
            overall_recommendation: recommendation || null,
            notes: notes || null,
            strengths: strengths || null,
            concerns: concerns || null,
          })
          .select()
          .single();

        if (evalError) throw evalError;

        // Insert scores
        const scoreInserts = Object.entries(scores).map(([criteriaId, { score, comment }]) => ({
          evaluation_id: evaluation.id,
          criteria_id: criteriaId,
          score,
          comment: comment || null,
        }));

        if (scoreInserts.length > 0) {
          const { error: scoresError } = await supabase
            .from("evaluation_scores")
            .insert(scoreInserts);
          if (scoresError) throw scoresError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-evaluation", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["all-evaluations", applicationId] });
      toast({ title: "Evaluation saved successfully" });
      onComplete?.();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save evaluation", description: err.message, variant: "destructive" });
    },
  });

  const handleScoreChange = (criteriaId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], score },
    }));
  };

  const handleCommentChange = (criteriaId: string, comment: string) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], comment, score: prev[criteriaId]?.score || 0 },
    }));
  };

  const renderStars = (criteriaId: string, maxScore: number) => {
    const currentScore = scores[criteriaId]?.score || 0;
    return (
      <div className="flex gap-1">
        {Array.from({ length: maxScore }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleScoreChange(criteriaId, star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= currentScore
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {currentScore > 0 ? `${currentScore}/${maxScore}` : "Not rated"}
        </span>
      </div>
    );
  };

  if (criteriaLoading || evalLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Group criteria by category
  const groupedCriteria = criteria.reduce((acc, c) => {
    const cat = c.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {} as Record<string, EvaluationCriteria[]>);

  const categoryLabels: Record<string, string> = {
    technical: "Technical Skills",
    soft_skills: "Soft Skills",
    cultural: "Cultural Fit",
    experience: "Experience",
    general: "General",
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Evaluate: {applicantName}</h3>
        <p className="text-sm text-muted-foreground">Position: {jobTitle}</p>
      </div>

      {/* Scoring Section */}
      {Object.entries(groupedCriteria).map(([category, criteriaList]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{categoryLabels[category] || category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {criteriaList.map((c) => (
              <div key={c.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{c.name}</Label>
                    {c.description && (
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                    )}
                  </div>
                  {renderStars(c.id, c.max_score)}
                </div>
                <Textarea
                  placeholder={`Comments for ${c.name}...`}
                  value={scores[c.id]?.comment || ""}
                  onChange={(e) => handleCommentChange(c.id, e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Strengths & Concerns */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Key Strengths</Label>
            <Textarea
              placeholder="What stood out positively about this candidate..."
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Areas of Concern</Label>
            <Textarea
              placeholder="Any concerns or areas that need further exploration..."
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Overall Recommendation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Overall Recommendation</CardTitle>
          <CardDescription>Your final assessment of this candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={recommendation}
            onValueChange={setRecommendation}
            className="grid grid-cols-5 gap-2"
          >
            {RECOMMENDATION_OPTIONS.map((opt) => (
              <div key={opt.value}>
                <RadioGroupItem
                  value={opt.value}
                  id={opt.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={opt.value}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all
                    peer-data-[state=checked]:${opt.bg} peer-data-[state=checked]:border-current
                    hover:bg-muted/50 ${recommendation === opt.value ? opt.bg : ""}`}
                >
                  <span className={`text-sm font-medium ${opt.color}`}>{opt.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <div>
        <Label>Additional Notes</Label>
        <Textarea
          placeholder="Any other observations or recommendations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-1"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
        <Button
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending || !recommendation}
        >
          {submitMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Submit Evaluation
        </Button>
      </div>
    </div>
  );
}
