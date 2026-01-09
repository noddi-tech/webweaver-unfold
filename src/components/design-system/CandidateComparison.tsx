import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { 
  Users, Plus, X, Star, ThumbsUp, ThumbsDown, AlertCircle,
  MapPin, Briefcase, GraduationCap, Calendar, Mail, Phone, Linkedin,
  BarChart3, Download
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  cover_letter: string | null;
  status: string | null;
  created_at: string | null;
  job_id: string;
  job_listings: {
    title: string;
    location: string | null;
  } | null;
}

interface Evaluation {
  id: string;
  application_id: string;
  evaluator_name: string;
  overall_recommendation: string | null;
  strengths: string | null;
  concerns: string | null;
  notes: string | null;
  submitted_at: string | null;
  evaluation_scores: {
    criteria_id: string;
    score: number;
    comment: string | null;
    evaluation_criteria: {
      name: string;
      max_score: number | null;
      weight: number | null;
    } | null;
  }[];
}

interface CriteriaScore {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
}

export function CandidateComparison() {
  const [searchParams] = useSearchParams();
  const idsFromUrl = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(idsFromUrl);

  // Fetch jobs
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs-for-comparison"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_listings")
        .select("id, title")
        .eq("active", true)
        .order("title");
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch applications for selected job
  const { data: applications = [] } = useQuery({
    queryKey: ["applications-for-comparison", selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return [];
      
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id, applicant_name, applicant_email, applicant_phone,
          linkedin_url, portfolio_url, cover_letter, status, created_at, job_id,
          job_listings (title, location)
        `)
        .eq("job_id", selectedJobId)
        .in("status", ["reviewing", "shortlisted", "interview"])
        .order("applicant_name");
      
      if (error) throw error;
      return data as Application[];
    },
    enabled: !!selectedJobId
  });

  // Fetch evaluations for selected candidates
  const { data: evaluations = [] } = useQuery({
    queryKey: ["evaluations-for-comparison", selectedCandidateIds],
    queryFn: async () => {
      if (selectedCandidateIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("candidate_evaluations")
        .select(`
          id, application_id, evaluator_name, overall_recommendation,
          strengths, concerns, notes, submitted_at,
          evaluation_scores (
            criteria_id, score, comment,
            evaluation_criteria (name, max_score, weight)
          )
        `)
        .in("application_id", selectedCandidateIds)
        .not("submitted_at", "is", null);
      
      if (error) throw error;
      return data as Evaluation[];
    },
    enabled: selectedCandidateIds.length > 0
  });

  // Process evaluations by candidate
  const candidateData = useMemo(() => {
    return selectedCandidateIds.map(candidateId => {
      const application = applications.find(a => a.id === candidateId);
      const candidateEvaluations = evaluations.filter(e => e.application_id === candidateId);
      
      // Aggregate scores across evaluators
      const scoresByCategoria: Record<string, { total: number; count: number; maxScore: number; weight: number }> = {};
      let totalWeightedScore = 0;
      let totalWeight = 0;
      
      candidateEvaluations.forEach(evaluation => {
        evaluation.evaluation_scores?.forEach(score => {
          const criteriaName = score.evaluation_criteria?.name || "Unknown";
          const maxScore = score.evaluation_criteria?.max_score || 5;
          const weight = score.evaluation_criteria?.weight || 1;
          
          if (!scoresByCategoria[criteriaName]) {
            scoresByCategoria[criteriaName] = { total: 0, count: 0, maxScore, weight };
          }
          scoresByCategoria[criteriaName].total += score.score;
          scoresByCategoria[criteriaName].count += 1;
        });
      });

      const criteriaScores: CriteriaScore[] = Object.entries(scoresByCategoria).map(([name, data]) => {
        const avgScore = data.count > 0 ? data.total / data.count : 0;
        totalWeightedScore += avgScore * data.weight;
        totalWeight += data.maxScore * data.weight;
        return {
          name,
          score: avgScore,
          maxScore: data.maxScore,
          weight: data.weight
        };
      });

      const overallScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;

      // Count recommendations
      const recommendations = candidateEvaluations.reduce((acc, e) => {
        const rec = e.overall_recommendation || "no_decision";
        acc[rec] = (acc[rec] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Collect strengths and concerns
      const allStrengths = candidateEvaluations
        .map(e => e.strengths)
        .filter(Boolean)
        .join("; ");
      
      const allConcerns = candidateEvaluations
        .map(e => e.concerns)
        .filter(Boolean)
        .join("; ");

      return {
        id: candidateId,
        application,
        evaluationCount: candidateEvaluations.length,
        overallScore,
        criteriaScores,
        recommendations,
        strengths: allStrengths,
        concerns: allConcerns
      };
    });
  }, [selectedCandidateIds, applications, evaluations]);

  const addCandidate = (candidateId: string) => {
    if (selectedCandidateIds.length >= 5) {
      return; // Max 5 candidates
    }
    if (!selectedCandidateIds.includes(candidateId)) {
      setSelectedCandidateIds([...selectedCandidateIds, candidateId]);
    }
  };

  const removeCandidate = (candidateId: string) => {
    setSelectedCandidateIds(selectedCandidateIds.filter(id => id !== candidateId));
  };

  // Get all unique criteria across all candidates
  const allCriteria = useMemo(() => {
    const criteriaSet = new Set<string>();
    candidateData.forEach(c => {
      c.criteriaScores.forEach(s => criteriaSet.add(s.name));
    });
    return Array.from(criteriaSet);
  }, [candidateData]);

  const getRecommendationBadge = (recommendations: Record<string, number>) => {
    const hire = (recommendations["hire"] || 0) + (recommendations["strong_hire"] || 0);
    const reject = recommendations["no_hire"] || 0;
    const maybe = recommendations["maybe"] || 0;
    const total = hire + reject + maybe;
    
    if (total === 0) return <Badge variant="outline">No evaluations</Badge>;
    
    if (hire > total / 2) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
        <ThumbsUp className="h-3 w-3 mr-1" />
        Hire ({hire}/{total})
      </Badge>;
    }
    if (reject > total / 2) {
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
        <ThumbsDown className="h-3 w-3 mr-1" />
        No Hire ({reject}/{total})
      </Badge>;
    }
    return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
      <AlertCircle className="h-3 w-3 mr-1" />
      Mixed ({maybe}/{total})
    </Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Candidate Comparison
          </h2>
          <p className="text-muted-foreground">Compare shortlisted candidates side by side</p>
        </div>
      </div>

      {/* Job Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedJobId} onValueChange={(v) => {
                setSelectedJobId(v);
                setSelectedCandidateIds([]);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job to compare candidates" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedJobId && (
              <Select onValueChange={addCandidate}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Add candidate to compare" />
                </SelectTrigger>
                <SelectContent>
                  {applications
                    .filter(a => !selectedCandidateIds.includes(a.id))
                    .map(app => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.applicant_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {selectedCandidateIds.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg mb-2">No candidates selected</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Select a job position and add candidates to compare their evaluations, scores, and qualifications side by side.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comparison Grid */}
      {selectedCandidateIds.length > 0 && (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4" style={{ minWidth: selectedCandidateIds.length * 300 }}>
            {candidateData.map(candidate => (
              <Card key={candidate.id} className="w-[300px] flex-shrink-0">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {candidate.application?.applicant_name || "Unknown"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {candidate.application?.status}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeCandidate(candidate.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Overall Score */}
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(candidate.overallScore)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                    <Progress value={candidate.overallScore} className="mt-2" />
                  </div>
                  
                  {/* Recommendation */}
                  <div className="flex justify-center">
                    {getRecommendationBadge(candidate.recommendations)}
                  </div>
                  
                  <Separator />
                  
                  {/* Criteria Scores */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Skills Assessment</h4>
                    {allCriteria.map(criteriaName => {
                      const score = candidate.criteriaScores.find(s => s.name === criteriaName);
                      const value = score ? score.score : 0;
                      const max = score?.maxScore || 5;
                      
                      return (
                        <div key={criteriaName} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{criteriaName}</span>
                            <span className="font-medium flex items-center">
                              {value.toFixed(1)}/{max}
                              <Star className="h-3 w-3 ml-1 text-yellow-500" />
                            </span>
                          </div>
                          <Progress value={(value / max) * 100} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                  
                  <Separator />
                  
                  {/* Strengths */}
                  {candidate.strengths && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-1 text-green-600">
                        <ThumbsUp className="h-4 w-4" />
                        Strengths
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {candidate.strengths}
                      </p>
                    </div>
                  )}
                  
                  {/* Concerns */}
                  {candidate.concerns && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-1 text-red-600">
                        <ThumbsDown className="h-4 w-4" />
                        Concerns
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {candidate.concerns}
                      </p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{candidate.application?.applicant_email}</span>
                    </div>
                    {candidate.application?.applicant_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{candidate.application.applicant_phone}</span>
                      </div>
                    )}
                    {candidate.application?.linkedin_url && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Linkedin className="h-4 w-4" />
                        <a 
                          href={candidate.application.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Applied {candidate.application?.created_at 
                          ? format(new Date(candidate.application.created_at), "MMM d, yyyy")
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Evaluation Count */}
                  <div className="text-center text-sm text-muted-foreground">
                    {candidate.evaluationCount} evaluation{candidate.evaluationCount !== 1 ? "s" : ""}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add More Card */}
            {selectedCandidateIds.length < 5 && selectedCandidateIds.length > 0 && (
              <Card className="w-[300px] flex-shrink-0 border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Plus className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground text-sm">Add another candidate</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Summary Stats */}
      {candidateData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Criteria</th>
                    {candidateData.map(c => (
                      <th key={c.id} className="text-center py-2 font-medium">
                        {c.application?.applicant_name}
                      </th>
                    ))}
                    <th className="text-center py-2 font-medium">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {allCriteria.map(criteriaName => {
                    const scores = candidateData.map(c => 
                      c.criteriaScores.find(s => s.name === criteriaName)?.score || 0
                    );
                    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                    const maxScore = candidateData[0]?.criteriaScores.find(s => s.name === criteriaName)?.maxScore || 5;
                    
                    return (
                      <tr key={criteriaName} className="border-b">
                        <td className="py-2 text-muted-foreground">{criteriaName}</td>
                        {scores.map((score, i) => {
                          const isHighest = score === Math.max(...scores) && score > 0;
                          return (
                            <td 
                              key={i} 
                              className={cn(
                                "text-center py-2",
                                isHighest && "font-bold text-primary"
                              )}
                            >
                              {score.toFixed(1)}
                            </td>
                          );
                        })}
                        <td className="text-center py-2 text-muted-foreground">
                          {avg.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="font-medium">
                    <td className="py-2">Overall Score</td>
                    {candidateData.map(c => {
                      const isHighest = c.overallScore === Math.max(...candidateData.map(cd => cd.overallScore));
                      return (
                        <td 
                          key={c.id} 
                          className={cn(
                            "text-center py-2",
                            isHighest && "text-primary"
                          )}
                        >
                          {Math.round(c.overallScore)}%
                        </td>
                      );
                    })}
                    <td className="text-center py-2 text-muted-foreground">
                      {Math.round(candidateData.reduce((a, c) => a + c.overallScore, 0) / candidateData.length)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
