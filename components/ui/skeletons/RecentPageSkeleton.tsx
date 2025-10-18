'use client';

import { Card } from '@/components/retroui/Card';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/retroui/Button';

export function RecentPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with static text */}
      <div className="flex justify-center">
        <div className="max-w-6xl w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center space-x-3">
                <BarChart3 className="h-7 w-7" />
                <span>Recent Evaluations</span>
              </h2>
              <p className="text-muted-foreground mt-1">
                Your job application evaluation history
              </p>
            </div>
            <Button>New Evaluation</Button>
          </div>
        </div>
      </div>

      {/* Grid skeleton only */}
      <div className="flex justify-center">
        <div className="max-w-6xl w-full">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Card.Content className="p-6">
                  <div className="space-y-4">
                    <div className="h-5 w-32 bg-muted border-2 border-border" />
                    <div className="h-2 w-full bg-muted border-2 border-border" />
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-8 w-8 mx-auto bg-muted border-2 border-border" />
                      ))}
                    </div>
                    <div className="h-9 w-full bg-muted border-2 border-border" />
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}