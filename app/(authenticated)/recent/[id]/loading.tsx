import { EvaluationCardSkeleton } from '@/components/ui/skeletons/EvaluationCardSkeleton';

export default function EvaluationLoading() {
  return (
    <div className="flex justify-center">
      <div className="max-w-4xl w-full">
        <EvaluationCardSkeleton />
      </div>
    </div>
  );
}