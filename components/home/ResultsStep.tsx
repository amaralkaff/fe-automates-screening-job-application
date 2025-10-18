'use client';

import { Card } from '@/components/retroui/Card';
import { CheckCircle } from 'lucide-react';
import EvaluationResults from '@/components/EvaluationResults';
import { EvaluationResult } from '@/lib/api';

interface ResultsStepProps {
  result: EvaluationResult;
  onNewEvaluation: () => void;
}

export function ResultsStep({ result, onNewEvaluation }: ResultsStepProps) {
  return (
    <div className="flex justify-center">
      <Card className="max-w-6xl w-full">
        <Card.Header>
          <div className="text-center">
            <Card.Title className="flex items-center justify-center space-x-3 text-xl">
              <CheckCircle className="h-7 w-7" />
              <span>Evaluation Report</span>
            </Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          <EvaluationResults
            result={result}
            onNewEvaluation={onNewEvaluation}
          />
        </Card.Content>
      </Card>
    </div>
  );
}