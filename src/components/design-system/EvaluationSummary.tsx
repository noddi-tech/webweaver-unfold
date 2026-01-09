import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Star, User, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { format } from "date-fns";

interface EvaluationSummaryProps {
  applicationId: string;
}

interface Evaluation {
  id: string;
  evaluator_name: string;
  overall_recommendation: string | null;
  notes: string | null;
  strengths: string | null;
  concerns: string | null;
  submitted_at: string;
  evaluation_scores: {
    id: string;
    criteria_id: string;
    score: number;
    comment: string | null;
  }[];
}

interface Criteria {
  id: string;
  name: string;
  max_score: number;
  weight: number;
  category: string;
}

const RECOMMENDATION_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  strong_hire: { label: "Strong Hire", color: "bg-green-100 text-green-800", icon: <ThumbsUp className="w-3 h-3" /> },
  hire: { label: "Hire", color: "bg-green-50 text-green-700", icon: <ThumbsUp className="w-3 h-3" /> },
  maybe: { label: "Maybe", color: "bg-yellow-100 text-yellow-800", icon: <Minus className="w-3 h-3" /> },
  no_hire: { label: "No Hire", color: "bg-orange-100 text-orange-800", icon: <ThumbsDown className="w-3 h-3" /> },
  strong_no_hire: { label: "Strong No", color: "bg-red-100 text-red-800", icon: <ThumbsDown className="w-3 h-3" /> },
};

export default function EvaluationSummary({ applicationId }: EvaluationSummaryProps) {
  // Fetch all evaluations for this application
  const { data: evaluations = [], isLoading: evalsLoading } = useQuery({
    queryKey: ["all-evaluations", applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_evaluations")
        .select(`
          *,
          evaluation_scores (*)
        `)
        .eq("application_id", applicationId)
        .order("submitted_at", { ascending: false });
      
      if (error) throw error;
      return data as Evaluation[];
    },
  });

  // Fetch criteria for labels
  const { data: criteria = [] } = useQuery({
    queryKey: ["evaluation-criteria"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_criteria")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Criteria[];
    },
  });

  if (evalsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No evaluations submitted yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Team members can submit evaluations using the form above.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate aggregate scores
  const criteriaMap = criteria.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {} as Record<string, Criteria>);

  const aggregateScores: Record<string, { total: number; count: number; max: number }> = {};
  evaluations.forEach((evaluation) => {
    evaluation.evaluation_scores.forEach((score) => {
      const criteriaItem = criteriaMap[score.criteria_id];
      if (!criteriaItem) return;
      
      if (!aggregateScores[score.criteria_id]) {
        aggregateScores[score.criteria_id] = { total: 0, count: 0, max: criteriaItem.max_score };
      }
      aggregateScores[score.criteria_id].total += score.score;
      aggregateScores[score.criteria_id].count += 1;
    });
  });

  // Recommendation breakdown
  const recommendationCounts = evaluations.reduce((acc, e) => {
    if (e.overall_recommendation) {
      acc[e.overall_recommendation] = (acc[e.overall_recommendation] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Overall weighted score
  let totalWeightedScore = 0;
  let totalWeight = 0;
  Object.entries(aggregateScores).forEach(([criteriaId, { total, count, max }]) => {
    const criteriaItem = criteriaMap[criteriaId];
    if (criteriaItem) {
      const avgScore = total / count;
      const normalizedScore = (avgScore / max) * 100;
      totalWeightedScore += normalizedScore * criteriaItem.weight;
      totalWeight += criteriaItem.weight;
    }
  });
  const overallScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Evaluations</p>
            <p className="text-3xl font-bold">{evaluations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Overall Score</p>
            <p className="text-3xl font-bold">{overallScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Top Recommendation</p>
            {Object.entries(recommendationCounts).length > 0 ? (
              <Badge className={RECOMMENDATION_LABELS[Object.entries(recommendationCounts).sort((a, b) => b[1] - a[1])[0][0]]?.color}>
                {RECOMMENDATION_LABELS[Object.entries(recommendationCounts).sort((a, b) => b[1] - a[1])[0][0]]?.label}
              </Badge>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendation Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recommendation Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(RECOMMENDATION_LABELS).map(([key, { label, color, icon }]) => (
              <Badge key={key} variant="outline" className={`${recommendationCounts[key] ? color : "opacity-40"}`}>
                {icon}
                <span className="ml-1">{label}: {recommendationCounts[key] || 0}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aggregate Scores by Criteria */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {criteria.map((c) => {
            const agg = aggregateScores[c.id];
            if (!agg) return null;
            
            const avgScore = agg.total / agg.count;
            const percentage = (avgScore / agg.max) * 100;
            
            return (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground">
                    {avgScore.toFixed(1)} / {agg.max}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Individual Evaluations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Individual Evaluations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {evaluations.map((evaluation) => (
            <div key={evaluation.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{evaluation.evaluator_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(evaluation.submitted_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                {evaluation.overall_recommendation && (
                  <Badge className={RECOMMENDATION_LABELS[evaluation.overall_recommendation]?.color}>
                    {RECOMMENDATION_LABELS[evaluation.overall_recommendation]?.icon}
                    <span className="ml-1">{RECOMMENDATION_LABELS[evaluation.overall_recommendation]?.label}</span>
                  </Badge>
                )}
              </div>

              {/* Scores */}
              <div className="flex flex-wrap gap-2">
                {evaluation.evaluation_scores.map((score) => {
                  const criteriaItem = criteriaMap[score.criteria_id];
                  if (!criteriaItem) return null;
                  return (
                    <div key={score.id} className="flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded">
                      <span>{criteriaItem.name}:</span>
                      <div className="flex">
                        {Array.from({ length: score.score }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strengths & Concerns */}
              {evaluation.strengths && (
                <div className="text-sm">
                  <span className="font-medium text-green-600">Strengths: </span>
                  <span className="text-muted-foreground">{evaluation.strengths}</span>
                </div>
              )}
              {evaluation.concerns && (
                <div className="text-sm">
                  <span className="font-medium text-orange-600">Concerns: </span>
                  <span className="text-muted-foreground">{evaluation.concerns}</span>
                </div>
              )}
              {evaluation.notes && (
                <div className="text-sm">
                  <span className="font-medium">Notes: </span>
                  <span className="text-muted-foreground">{evaluation.notes}</span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
