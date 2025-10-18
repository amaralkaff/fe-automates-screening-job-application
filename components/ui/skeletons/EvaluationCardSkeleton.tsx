'use client';

import { Card } from '@/components/retroui/Card';

export function EvaluationCardSkeleton() {
  return (
    <Card>
      <Card.Content className="p-6">
        <div className="space-y-4">
          <div className="h-5 w-32 bg-muted border-2 border-border" />
          <div className="h-2 w-full bg-muted border-2 border-border" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 mx-auto bg-muted border-2 border-border" />
            ))}
          </div>
          <div className="h-9 w-full bg-muted border-2 border-border" />
        </div>
      </Card.Content>
    </Card>
  );
}