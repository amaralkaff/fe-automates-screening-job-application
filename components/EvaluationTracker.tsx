'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/retroui/Progress';
import { Badge } from '@/components/retroui/Badge';
import { Button } from '@/components/retroui/Button';
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Brain,
  FileText,
  TrendingUp,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { apiClient, EvaluationResult } from '@/lib/api';

interface EvaluationTrackerProps {
  jobId: string;
  onComplete: (result: EvaluationResult) => void;
  onError: (error: Error) => void;
}

interface EvaluationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  icon: React.ReactNode;
}

const EVALUATION_STEPS: EvaluationStep[] = [
  {
    id: 'queued',
    title: 'Queueing',
    description: 'Your evaluation is being queued',
    status: 'pending',
    icon: <Clock className="h-5 w-5" />
  },
  {
    id: 'processing',
    title: 'Document Analysis',
    description: 'Analyzing documents',
    status: 'pending',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'cv_evaluation',
    title: 'CV Evaluation',
    description: 'Evaluating CV with AI',
    status: 'pending',
    icon: <Brain className="h-5 w-5" />
  },
  {
    id: 'project_evaluation',
    title: 'Project Evaluation',
    description: 'Assessing project quality',
    status: 'pending',
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: 'final_analysis',
    title: 'Final Analysis',
    description: 'Generating summary',
    status: 'pending',
    icon: <CheckCircle className="h-5 w-5" />
  }
];

export default function EvaluationTracker({ jobId, onComplete, onError }: EvaluationTrackerProps) {
  const [currentResult, setCurrentResult] = useState<EvaluationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const result = await apiClient.getJobStatus(jobId);
        setCurrentResult(result);

        switch (result.status) {
          case 'queued':
            setCurrentStep(0);
            setProgress(10);
            break;
          case 'processing':
            const actualProgress = result.progress || 0;
            setProgress(Math.min(90, Math.max(20, actualProgress)));

            if (actualProgress >= 80) setCurrentStep(4);
            else if (actualProgress >= 60) setCurrentStep(3);
            else if (actualProgress >= 40) setCurrentStep(2);
            else if (actualProgress >= 20) setCurrentStep(1);
            else setCurrentStep(0);
            break;
          case 'completed':
            setProgress(100);
            setCurrentStep(5);
            onComplete(result);
            return;
          case 'failed':
            setProgress(0);
            onError(new Error(result.error || 'Evaluation failed'));
            return;
        }

        timeoutId = setTimeout(pollStatus, 2000);
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Failed to check evaluation status'));
      }
    };

    pollStatus();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [jobId, onComplete, onError]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const result = await apiClient.getJobStatus(jobId);
      setCurrentResult(result);
      setIsRetrying(false);
    } catch (error) {
      setIsRetrying(false);
      onError(error instanceof Error ? error : new Error('Retry failed'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepIcon = (step: EvaluationStep, index: number) => {
    if (index < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (index === currentStep && currentResult?.status === 'processing') {
      return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    } else if (currentResult?.status === 'failed') {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return step.icon;
  };

  if (!currentResult) {
    return (
      <div className="flex items-center justify-center py-8 space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Initializing evaluation...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex justify-center">
        <Badge className={`${getStatusColor(currentResult.status)} text-sm px-4 py-1`}>
          {currentResult.status.charAt(0).toUpperCase() + currentResult.status.slice(1)}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
        <p className="text-xs text-muted-foreground text-center">
          Job ID: <code className="bg-muted px-2 py-0.5 rounded">{jobId}</code>
        </p>
      </div>

      {/* Evaluation Steps */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-center mb-4">Evaluation Steps</h3>
        {EVALUATION_STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
              index <= currentStep 
                ? 'bg-muted/50 border border-border' 
                : 'bg-transparent border border-transparent opacity-50'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStepIcon(step, index)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium">{step.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            </div>
            {index === currentStep && currentResult?.status === 'processing' && (
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Processing Information */}
      {currentResult.status === 'processing' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-blue-900">
              <p className="font-medium mb-1">Processing your evaluation</p>
              <p className="text-xs text-blue-700">
                This typically takes 1-2 minutes. AI is analyzing your documents against job requirements.
              </p>
              {/* <div className="flex items-center space-x-2 mt-2 text-xs text-blue-700">
                <Clock className="h-3 w-3" />
                <span>Est. time remaining: {Math.max(1, Math.ceil((100 - progress) / 20))} min</span>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {currentResult.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-center space-y-3">
            <XCircle className="h-6 w-6 mx-auto text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">Evaluation Failed</p>
              <p className="text-xs text-red-700 mt-1">
                The process encountered an error. Please try again in a few minutes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}