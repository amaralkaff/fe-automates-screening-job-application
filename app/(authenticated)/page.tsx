'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Alert } from '@/components/retroui/Alert';
import { ProgressBar } from '@/components/home/ProgressBar';
import { UploadStep } from '@/components/home/UploadStep';
import { JobTitleStep } from '@/components/home/JobTitleStep';
import { EvaluatingStep } from '@/components/home/EvaluatingStep';
import { ResultsStep } from '@/components/home/ResultsStep';
import { ErrorStep } from '@/components/home/ErrorStep';
import RateLimitError from '@/components/RateLimitError';
import { useEvaluationFlow } from '@/hooks/useEvaluationFlow';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    step,
    cvFile,
    projectReportFile,
    jobTitle,
    jobId,
    evaluationResult,
    isLoading,
    error,
    rateLimitError,
    setStep,
    setJobTitle,
    resetToStart,
    handleFilesChange,
    handleContinueToJobTitle,
    handleStartEvaluation,
    handleEvaluationComplete,
    handleEvaluationError,
    handleRetryRateLimit,
    handleSelectEvaluation,
  } = useEvaluationFlow();

  // Handle viewing results from recent evaluations
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'results') {
      const storedEvaluation = sessionStorage.getItem('selectedEvaluation');
      if (storedEvaluation) {
        const evaluation = JSON.parse(storedEvaluation);
        handleSelectEvaluation(evaluation);
        sessionStorage.removeItem('selectedEvaluation');
      }
    }
  }, [searchParams, handleSelectEvaluation]);

  return (
    <>
      <ProgressBar currentStep={step} />

      {/* Error Display */}
      {error && (
        <Alert status="error" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      )}

      {/* Upload Step */}
      {step === 'upload' && (
        <UploadStep
          cvFile={cvFile}
          projectReportFile={projectReportFile}
          isLoading={isLoading}
          onFilesChange={handleFilesChange}
          onContinue={handleContinueToJobTitle}
        />
      )}

      {/* Job Title Step */}
      {step === 'job-title' && (
        <JobTitleStep
          jobTitle={jobTitle}
          cvFile={cvFile}
          projectReportFile={projectReportFile}
          isLoading={isLoading}
          onJobTitleChange={setJobTitle}
          onBack={() => setStep('upload')}
          onStartEvaluation={handleStartEvaluation}
        />
      )}

      {/* Evaluating Step */}
      {step === 'evaluating' && (
        <EvaluatingStep
          jobId={jobId}
          onComplete={handleEvaluationComplete}
          onError={handleEvaluationError}
        />
      )}

      {/* Results Step */}
      {step === 'results' && evaluationResult && (
        <ResultsStep
          result={evaluationResult}
          onNewEvaluation={resetToStart}
        />
      )}

      {/* Error Step */}
      {step === 'error' && (
        <ErrorStep
          error={error}
          onRetry={() => setStep('job-title')}
          onStartNew={resetToStart}
        />
      )}

      {/* Rate Limit Step */}
      {step === 'rate-limit' && rateLimitError && (
        <RateLimitError
          error={rateLimitError}
          onRetry={handleRetryRateLimit}
          onViewHistory={() => router.push('/recent')}
        />
      )}
    </>
  );
}
