'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { AlertTriangle, BarChart3, Calendar, Eye } from 'lucide-react';
import { Card } from '@/components/retroui/Card';
import { Button } from '@/components/retroui/Button';
import { Badge } from '@/components/retroui/Badge';
import { Alert } from '@/components/retroui/Alert';
import { EvaluationCardSkeleton } from '@/components/ui/skeletons/EvaluationCardSkeleton';
import { RecentPageSkeleton } from '@/components/ui/skeletons/RecentPageSkeleton';
import { apiClient, EvaluationResult } from '@/lib/api';

interface EvaluationSummaryProps {
  evaluation: EvaluationResult;
  onSelect: () => void;
}

function EvaluationSummary({ evaluation, onSelect }: EvaluationSummaryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return 'text-green-600';
    if (score >= 3.0) return 'text-blue-600';
    if (score >= 2.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendation = (overallScore: number) => {
    if (overallScore >= 4.0) return 'Highly Recommended';
    if (overallScore >= 3.0) return 'Recommended';
    if (overallScore >= 2.0) return 'Consider with Reservations';
    return 'Not Recommended';
  };

  const getRecommendationColor = (overallScore: number) => {
    if (overallScore >= 4.0) return 'text-green-600 bg-green-50 border-green-200';
    if (overallScore >= 3.0) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (overallScore >= 2.0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const overallScore = evaluation.result?.finalScore.overallScore || 0;
  const cvScore = evaluation.result?.finalScore.cvScore || 0;
  const projectScore = evaluation.result?.finalScore.projectScore || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <Card.Content className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* <Brain className="h-6 w-6 text-blue-600" /> */}
              <div>
                <h3 className="font-semibold text-base sm:text-lg">Evaluation Report</h3>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{formatDate(evaluation.createdAt)}</span>
                </div>
              </div>
            </div>
            <Badge className={`${getStatusColor(evaluation.status)} text-xs sm:text-sm`}>
              {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
            </Badge>
          </div>

          {evaluation.status === 'processing' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Progress</span>
                <span>{Math.round(evaluation.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${evaluation.progress}%` }}
                />
              </div>
            </div>
          )}

          {evaluation.result && (
            <div className="space-y-3">
              <div className={`p-2 sm:p-3 rounded-lg border ${getRecommendationColor(overallScore)}`}>
                <span className="font-medium text-xs sm:text-sm">{getRecommendation(overallScore)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center">
                  <div className={`text-lg sm:text-2xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Overall</div>
                </div>
                <div className="text-center">
                  <div className={`text-base sm:text-xl font-semibold ${getScoreColor(cvScore)}`}>
                    {cvScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">CV Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-base sm:text-xl font-semibold ${getScoreColor(projectScore)}`}>
                    {projectScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Project</div>
                </div>
              </div>
            </div>
          )}

          {evaluation.status === 'failed' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <Alert.Description>
                {evaluation.error || 'Evaluation failed to complete'}
              </Alert.Description>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm h-8 sm:h-9">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {evaluation.status === 'completed' ? 'View Full Report' :
               evaluation.status === 'processing' ? 'View Progress' : 'View Details'}
            </Button>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

export default function RecentPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setIsLoading(true);
      setError('');
      const userEvaluations = await apiClient.getUserEvaluations();
      setEvaluations(userEvaluations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch evaluations';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <RecentPageSkeleton />;
  }

  const handleSelectEvaluation = (evaluationId: string) => {
    router.push(`/recent/${evaluationId}`);
  };

  if (error) {
    return (
      <div className="flex justify-center">
        <Card className="max-w-6xl w-full">
          <Card.Content className="p-8">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto" />
              <p className="text-muted-foreground">{error}</p>
              <div className="flex space-x-3 justify-center">
                <Button variant="outline" onClick={fetchEvaluations}>
                  Try Again
                </Button>
                <Link href="/">
                  <Button>New Evaluation</Button>
                </Link>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="flex justify-center">
        <Card className="max-w-6xl w-full">
          <Card.Content className="p-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <BarChart3 className="h-12 w-12 text-gray-600 mx-auto" />
                <h2 className="text-2xl font-bold">No Evaluations Yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You haven&apos;t completed any job application evaluations yet. Start your first evaluation to see your results here.
                </p>
              </div>
              <div className="flex justify-center">
                <Link href="/">
                  <Button size="lg" className="min-w-[200px]">
                    {/* <Brain className="h-5 w-5 mr-2" /> */}
                    Start Your First Evaluation
                  </Button>
                </Link>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-center">
        <div className="max-w-6xl w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center space-x-2 sm:space-x-3">
                <BarChart3 className="h-5 w-5 sm:h-7 sm:w-7" />
                <span>Recent Evaluations</span>
              </h2>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                Your job application evaluation history ({evaluations.length} evaluations)
              </p>
            </div>
            <Link href="/">
              <Button size="sm" className="w-full sm:w-auto">
                New Evaluation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="max-w-6xl w-full">
          <Suspense
            fallback={
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <EvaluationCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {evaluations.map((evaluation) => (
                <EvaluationSummary
                  key={evaluation.id}
                  evaluation={evaluation}
                  onSelect={() => handleSelectEvaluation(evaluation.id)}
                />
              ))}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}