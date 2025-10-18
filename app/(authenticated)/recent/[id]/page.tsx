'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { apiClient, EvaluationResult } from '@/lib/api';
import { ResultsStep } from '@/components/home/ResultsStep';
import { EvaluationCardSkeleton } from '@/components/ui/skeletons/EvaluationCardSkeleton';

export default function EvaluationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const evaluationId = params.id as string;

  useEffect(() => {
    const fetchEvaluation = async () => {
      if (!evaluationId) return;

      try {
        setIsLoading(true);
        const result = await apiClient.getEvaluationById(evaluationId);
        setEvaluation(result);
      } catch (err) {
        console.error('Error fetching evaluation:', err);
        setError('Failed to load evaluation. It may not exist or you may not have access to it.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluation();
  }, [evaluationId]);

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="max-w-4xl w-full">
          <EvaluationCardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Evaluation Not Found</h1>
        <p className="text-muted-foreground">
          {error || 'The evaluation you are looking for could not be found.'}
        </p>
        <div className="flex justify-center space-x-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Link href="/recent">
            <Button>View All Evaluations</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleNewEvaluation = () => {
    router.push('/');
  };

  return (
    <>
      <div className="mb-6">
        <Link href="/recent">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Recent Evaluations</span>
          </Button>
        </Link>
      </div>

      <ResultsStep
        result={evaluation}
        onNewEvaluation={handleNewEvaluation}
      />
    </>
  );
}