'use client';

import { CheckCircle } from 'lucide-react';

type ApplicationStep = 'upload' | 'job-title' | 'evaluating' | 'results' | 'error' | 'recent-evaluations' | 'rate-limit';

interface ProgressBarProps {
  currentStep: ApplicationStep;
}

const PROGRESS_STEPS = [
  { id: 'upload' as const, label: 'Submit Your Documents' },
  { id: 'job-title' as const, label: 'Define Target Role' },
  { id: 'evaluating' as const, label: 'Analysis in Progress' },
  { id: 'results' as const, label: 'Evaluation Report' }
];

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const currentStepIndex = PROGRESS_STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="mb-8">
      {/* Mobile: Vertical Progress */}
      <div className="md:hidden space-y-4">
        {PROGRESS_STEPS.map((stepItem, index) => (
          <div key={stepItem.id} className="flex items-center space-x-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium flex-shrink-0
                ${index <= currentStepIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {index < currentStepIndex ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-sm ${
                index <= currentStepIndex ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {stepItem.label}
              </div>
              {index < PROGRESS_STEPS.length - 1 && (
                <div className={`h-0.5 w-full mt-2 ${
                  index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Horizontal Progress */}
      <div className="hidden md:flex items-center justify-center space-x-2 lg:space-x-4">
        {PROGRESS_STEPS.map((stepItem, index) => (
          <div key={stepItem.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium
                ${index <= currentStepIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {index < currentStepIndex ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              index <= currentStepIndex ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {stepItem.label}
            </span>
            {index < PROGRESS_STEPS.length - 1 && (
              <div className={`w-8 lg:w-12 h-0.5 mx-2 lg:mx-4 ${
                index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}