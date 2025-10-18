'use client';

import { Card } from '@/components/retroui/Card';
import { Button } from '@/components/retroui/Button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

interface UploadStepProps {
  cvFile: File | null;
  projectReportFile: File | null;
  isLoading: boolean;
  onFilesChange: (cv: File | null, project: File | null) => void;
  onContinue: () => void;
}

export function UploadStep({
  cvFile,
  projectReportFile,
  isLoading,
  onFilesChange,
  onContinue
}: UploadStepProps) {
  return (
    <div className="flex justify-center">
      <Card className="max-w-6xl w-full">
        <Card.Header>
          <div className="text-center">
            <Card.Title className="flex items-center justify-center space-x-3 text-xl">
              <span>Submit Your Application Materials</span>
            </Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="space-y-8">
            <FileUpload
              onFilesChange={onFilesChange}
              disabled={isLoading}
            />

            <div className="flex flex-col gap-4 pt-4 border-t">
              <div className="text-center sm:text-left text-sm text-muted-foreground">
                {cvFile && projectReportFile ? (
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Both documents ready for analysis</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <span>Please upload both documents to continue</span>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={onContinue}
                  disabled={!cvFile || !projectReportFile || isLoading}
                  size="lg"
                  className="min-w-[200px] w-full sm:w-auto"
                >
                  Continue to Job Details
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}