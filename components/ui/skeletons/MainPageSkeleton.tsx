'use client';

import { Card } from '@/components/retroui/Card';

export function MainPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <Card className="max-w-2xl w-full">
          <Card.Content className="p-8">
            <div className="space-y-4">
              <div className="h-10 w-80 mx-auto bg-muted border-2 border-border" />
              <div className="h-20 w-96 mx-auto bg-muted border-2 border-border" />
              <div className="h-12 w-48 mx-auto bg-muted border-2 border-border" />
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}