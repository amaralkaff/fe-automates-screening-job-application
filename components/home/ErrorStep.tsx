'use client';

import { Card } from '@/components/retroui/Card';
import { Button } from '@/components/retroui/Button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface ErrorStepProps {
  error: string;
  onRetry: () => void;
  onStartNew: () => void;
}

export function ErrorStep({ error, onRetry, onStartNew }: ErrorStepProps) {
  return (
    <div className="flex justify-center">
      <Card className="max-w-6xl w-full">
        <Card.Header>
          <div className="text-center">
            <Card.Title className="flex items-center justify-center space-x-3 text-xl">
              <AlertTriangle className="h-7 w-7 text-red-600" />
              <span>Evaluation Failed</span>
            </Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {error || 'An unexpected error occurred during evaluation.'}
            </p>
            <div className="flex space-x-3 justify-center">
              <Button variant="outline" onClick={onRetry}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={onStartNew}>
                Start New Evaluation
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}