'use client';

import { Card } from '@/components/retroui/Card';
import { Brain } from 'lucide-react';
import EvaluationTracker from '@/components/EvaluationTracker';
import { EvaluationResult } from '@/lib/api';

interface EvaluatingStepProps {
  jobId: string;
  onComplete: (result: EvaluationResult) => void;
  onError: (error: Error) => void;
}

export function EvaluatingStep({ jobId, onComplete, onError }: EvaluatingStepProps) {
  return (
    <div className="flex justify-center">
      <Card className="max-w-6xl w-full">
        <Card.Header>
          <div className="text-center">
            <Card.Title className="flex items-center justify-center space-x-3 text-xl">
              {/* <Brain className="h-7 w-7" /> */}
              <span>Analysis in Progress</span>
            </Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          <EvaluationTracker
            jobId={jobId}
            onComplete={onComplete}
            onError={onError}
          />
        </Card.Content>
      </Card>
    </div>
  );
}