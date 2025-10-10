import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEvaluationProgress } from '@/hooks/useEvaluationProgress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Zap,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import { cn } from '@/lib/utils';

export default function EvaluationHealthDashboard() {
  const { allProgress, loading, refresh } = useEvaluationProgress();
  const [stats, setStats] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    activeEvaluations: 0,
    averageTime: 0,
    successRate: 0,
    totalEvaluated: 0
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateSystemHealth();
  }, [allProgress, stats]);

  async function loadStats() {
    const { data } = await supabase.from('translation_stats' as any).select('*');
    if (data) setStats(data);
  }

  function calculateSystemHealth() {
    const activeCount = allProgress.filter(p => p.status === 'in_progress').length;
    const completedEvals = allProgress.filter(p => p.completed_at);
    
    // Calculate average evaluation time
    let totalTime = 0;
    let timeCount = 0;
    completedEvals.forEach(p => {
      if (p.started_at && p.completed_at) {
        const start = new Date(p.started_at).getTime();
        const end = new Date(p.completed_at).getTime();
        totalTime += (end - start);
        timeCount++;
      }
    });
    const avgTime = timeCount > 0 ? Math.round(totalTime / timeCount / 1000) : 0;

    // Calculate success rate
    const totalAttempts = allProgress.length;
    const successCount = allProgress.filter(p => p.status === 'completed').length;
    const successRate = totalAttempts > 0 ? Math.round((successCount / totalAttempts) * 100) : 0;

    // Total evaluated
    const totalEvaluated = allProgress.reduce((sum, p) => sum + (p.evaluated_keys || 0), 0);

    setSystemHealth({
      activeEvaluations: activeCount,
      averageTime: avgTime,
      successRate,
      totalEvaluated
    });
  }

  function detectStuckEvaluations() {
    const now = Date.now();
    const stuckThreshold = 10 * 60 * 1000; // 10 minutes
    
    return allProgress.filter(p => {
      if (p.status !== 'in_progress') return false;
      const lastUpdate = new Date(p.updated_at).getTime();
      const timeSinceUpdate = now - lastUpdate;
      return (timeSinceUpdate > stuckThreshold) || 
             (p.evaluated_keys === 0 && timeSinceUpdate > 5 * 60 * 1000);
    });
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'paused':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  }

  function getStatusBadge(status: string) {
    const variants: any = {
      completed: 'default',
      in_progress: 'secondary',
      paused: 'outline',
      error: 'destructive',
      idle: 'secondary'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  }

  function formatDuration(ms: number | null) {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  function calculateElapsedTime(startedAt: string) {
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    return formatDuration(now - start);
  }

  const FlagIcon = ({ code }: { code: string }) => {
    const flagMap: Record<string, any> = {
      'en': Flags.GB, 'de': Flags.DE, 'fr': Flags.FR, 'es': Flags.ES,
      'it': Flags.IT, 'pt': Flags.PT, 'nl': Flags.NL, 'pl': Flags.PL,
      'sv': Flags.SE, 'no': Flags.NO, 'da': Flags.DK, 'fi': Flags.FI,
      'cs': Flags.CZ, 'ro': Flags.RO, 'hu': Flags.HU, 'tr': Flags.TR,
    };
    const Flag = flagMap[code] || Flags.GB;
    return <Flag className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Health Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Evaluations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.activeEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time/Language</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.averageTime}s</div>
            <p className="text-xs text-muted-foreground">
              Per complete evaluation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluated</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.totalEvaluated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Translations processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stuck Evaluations Warning */}
      {(() => {
        const stuckEvals = detectStuckEvaluations();
        return stuckEvals.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{stuckEvals.length} evaluation(s) appear stuck</strong>
              <br />
              Languages: {stuckEvals.map(e => {
                const langStat = stats.find(s => s.code === e.language_code);
                return langStat?.name || e.language_code;
              }).join(', ')}
              <br />
              <span className="text-sm">Go to "Translations" tab and click "Reset Stuck Evaluations" to fix.</span>
            </AlertDescription>
          </Alert>
        );
      })()}

      {/* Active Evaluations */}
      {systemHealth.activeEvaluations > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
              Active Evaluations
            </CardTitle>
            <CardDescription>
              Real-time progress of ongoing quality evaluations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allProgress
              .filter(p => p.status === 'in_progress')
              .map(progress => {
                const langStat = stats.find(s => s.code === progress.language_code);
                const percentage = progress.total_keys > 0 
                  ? Math.round((progress.evaluated_keys / progress.total_keys) * 100) 
                  : 0;

                return (
                  <div key={progress.language_code} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FlagIcon code={progress.language_code} />
                        <span className="font-medium">{langStat?.name || progress.language_code}</span>
                        <Badge variant="secondary" className="animate-pulse">
                          {percentage}%
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {progress.evaluated_keys} / {progress.total_keys}
                        {progress.started_at && (
                          <span className="ml-2">
                            • {calculateElapsedTime(progress.started_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    {progress.last_evaluated_key && (
                      <p className="text-xs text-muted-foreground">
                        Last key: {progress.last_evaluated_key}
                      </p>
                    )}
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* All Language Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Language Evaluation Status</CardTitle>
            <CardDescription>
              Complete overview of quality evaluation progress
            </CardDescription>
          </div>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allProgress.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No evaluations started yet. Use "Evaluate All Languages" to begin.
              </div>
            ) : (
              allProgress.map(progress => {
                const langStat = stats.find(s => s.code === progress.language_code);
                const percentage = progress.total_keys > 0 
                  ? Math.round((progress.evaluated_keys / progress.total_keys) * 100) 
                  : 0;

                let duration = null;
                if (progress.started_at && progress.completed_at) {
                  const start = new Date(progress.started_at).getTime();
                  const end = new Date(progress.completed_at).getTime();
                  duration = end - start;
                }

                return (
                  <div 
                    key={progress.language_code}
                    className={cn(
                      "border rounded-lg p-4 space-y-3 transition-colors",
                      progress.status === 'in_progress' && "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(progress.status)}
                        <FlagIcon code={progress.language_code} />
                        <div>
                          <div className="font-medium">{langStat?.name || progress.language_code}</div>
                          <div className="text-sm text-muted-foreground">
                            {progress.evaluated_keys.toLocaleString()} / {progress.total_keys.toLocaleString()} translations
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(progress.status)}
                        {progress.status === 'completed' && duration && (
                          <Badge variant="outline">
                            {formatDuration(duration)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {progress.total_keys > 0 && (
                      <div className="space-y-1">
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{percentage}% complete</span>
                          {progress.status === 'in_progress' && progress.started_at && (
                            <span>Running for {calculateElapsedTime(progress.started_at)}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {progress.error_message && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {progress.error_message}
                        </AlertDescription>
                      </Alert>
                    )}

                    {progress.last_evaluated_key && progress.status !== 'completed' && (
                      <div className="text-xs text-muted-foreground">
                        Last processed: <code className="bg-muted px-1 rounded">{progress.last_evaluated_key}</code>
                      </div>
                    )}

                    {progress.completed_at && (
                      <div className="text-xs text-muted-foreground">
                        Completed: {new Date(progress.completed_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnostics & Troubleshooting</CardTitle>
          <CardDescription>
            Tools to monitor and debug evaluation issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open('https://supabase.com/dashboard/project/ouhfgazomdmirdazvjys/functions/evaluate-translation-quality/logs', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Edge Function Logs
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open('https://supabase.com/dashboard/project/ouhfgazomdmirdazvjys/database/tables', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Database Tables
          </Button>

          <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Tip:</strong> Evaluations auto-resume if they timeout</p>
            <p>💡 <strong>Batch size:</strong> 20 translations per batch (~15s each)</p>
            <p>💡 <strong>Max execution:</strong> 100s before auto-resume</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
