'use client';

import { useState } from 'react';
import { apiClient, EvaluationResult, ApiError } from '@/lib/api';

export type ApplicationStep = 'upload' | 'job-title' | 'evaluating' | 'results' | 'error' | 'rate-limit';

export function useEvaluationFlow() {
  const [step, setStep] = useState<ApplicationStep>('upload');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [projectReportFile, setProjectReportFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobId, setJobId] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [rateLimitError, setRateLimitError] = useState<ApiError | null>(null);

  const resetToStart = () => {
    setStep('upload');
    setCvFile(null);
    setProjectReportFile(null);
    setJobTitle('');
    setJobId('');
    setEvaluationResult(null);
    setError('');
  };

  const handleFilesChange = (cv: File | null, project: File | null) => {
    setCvFile(cv);
    setProjectReportFile(project);
    setError('');
  };

  const handleContinueToJobTitle = () => {
    if (!cvFile || !projectReportFile) {
      setError('Please upload both CV and project report');
      return;
    }
    setStep('job-title');
  };

  const handleStartEvaluation = async () => {
    if (!jobTitle.trim()) {
      setError('Please enter a job title');
      return;
    }

    setIsLoading(true);
    setError('');
    setError('Uploading files... This may take a few moments for processing.');

    try {
      console.log('=== Starting Evaluation ===');
      console.log('Files to upload:', {
        cvFile: {
          name: cvFile?.name,
          size: cvFile?.size,
          type: cvFile?.type
        },
        projectFile: {
          name: projectReportFile?.name,
          size: projectReportFile?.size,
          type: projectReportFile?.type
        }
      });

      // Step 1: Upload documents
      setError('Processing documents... This may take 1-3 minutes.');
      const uploadResponse = await apiClient.uploadDocuments(cvFile!, projectReportFile!);

      // Step 2: Trigger evaluation
      setError('Starting evaluation...');
      const evaluationResponse = await apiClient.triggerEvaluation({
        jobTitle: jobTitle.trim(),
        cvDocumentId: uploadResponse.cvDocumentId,
        projectReportId: uploadResponse.projectReportId
      });

      setJobId(evaluationResponse.jobId);
      setStep('evaluating');
      setError(''); // Clear the message when moving to evaluation
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to start evaluation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluationComplete = (result: EvaluationResult) => {
    setEvaluationResult(result);
    setStep('results');
  };

  const handleEvaluationError = (err: Error) => {
    // Check if this is a rate limit error
    if (err instanceof ApiError && err.isRateLimitError()) {
      setRateLimitError(err);
      setStep('rate-limit');
    } else {
      setError(err.message);
      setStep('error');
    }
  };

  const handleRetryRateLimit = () => {
    setRateLimitError(null);
    setStep('job-title');
  };

  const handleSelectEvaluation = (evaluation: EvaluationResult) => {
    setEvaluationResult(evaluation);
    setStep('results');
  };

  return {
    // State
    step,
    cvFile,
    projectReportFile,
    jobTitle,
    jobId,
    evaluationResult,
    isLoading,
    error,
    rateLimitError,
    // State setters
    setStep,
    setJobTitle,
    // Handlers
    resetToStart,
    handleFilesChange,
    handleContinueToJobTitle,
    handleStartEvaluation,
    handleEvaluationComplete,
    handleEvaluationError,
    handleRetryRateLimit,
    handleSelectEvaluation,
  };
}