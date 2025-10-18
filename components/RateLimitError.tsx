'use client';

import { Card } from '@/components/retroui/Card';
import { Button } from '@/components/retroui/Button';
import { Alert } from '@/components/retroui/Alert';
import { ApiError } from '@/lib/api';
import {
  Clock,
  Timer,
  AlertTriangle,
  RefreshCw,
  Calendar,
  BarChart3
} from 'lucide-react';

interface RateLimitErrorProps {
  error: ApiError;
  onRetry?: () => void;
  onViewHistory?: () => void;
}

export default function RateLimitError({ error, onRetry, onViewHistory }: RateLimitErrorProps) {
  const rateLimitInfo = error.getRateLimitInfo();
  const limit = rateLimitInfo?.limit || 3;
  const period = rateLimitInfo?.period || 'hour';

  const getWaitTimeMessage = () => {
    if (period === 'hour') {
      return 'Please wait until the next hour to continue.';
    } else if (period === 'day') {
      return 'Please wait until tomorrow to continue.';
    } else {
      return `Please wait until the next ${period} to continue.`;
    }
  };

  const getNextAvailableTime = () => {
    const now = new Date();
    if (period === 'hour') {
      const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
      return nextHour.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (period === 'day') {
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return tomorrow.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
    return null;
  };

  const nextAvailableTime = getNextAvailableTime();

  return (
    <div className="flex justify-center">
      <Card className="max-w-2xl w-full">
        <Card.Header>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
                <Timer className="h-6 w-6 text-yellow-600" />
              </div>
              <Card.Title className="text-xl">Evaluation Limit Reached</Card.Title>
            </div>
            <p className="text-muted-foreground">
              You've reached your evaluation limit for this {period}
            </p>
          </div>
        </Card.Header>

        <Card.Content className="space-y-6">
          {/* Rate Limit Info */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <Alert.Description>
              You have used all {limit} evaluation tests available per {period}.
            </Alert.Description>
          </Alert>

          {/* Limit Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Your Limit</span>
              </div>
              <span className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {limit} per {period}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="font-medium">Next Available</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {nextAvailableTime || `Next ${period}`}
              </span>
            </div>
          </div>

          {/* Wait Time Message */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              {getWaitTimeMessage()}
            </p>
            {nextAvailableTime && (
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                <Calendar className="h-4 w-4" />
                <span>Available again at {nextAvailableTime}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </Button>
            )}

            {onViewHistory && (
              <Button
                onClick={onViewHistory}
                className="flex items-center justify-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>View Past Evaluations</span>
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground text-center border-t pt-4">
            <p>
              This limit helps ensure fair usage and maintains service quality for all users.
              If you need additional evaluations, please contact support.
            </p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}