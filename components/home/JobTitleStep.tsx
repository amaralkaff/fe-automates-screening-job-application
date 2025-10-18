'use client';

import { Card } from '@/components/retroui/Card';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Label } from '@/components/retroui/Label';
import { Badge } from '@/components/retroui/Badge';
import { FileText, Loader2, CheckCircle, ArrowLeft, Brain } from 'lucide-react';

interface JobTitleStepProps {
  jobTitle: string;
  cvFile: File | null;
  projectReportFile: File | null;
  isLoading: boolean;
  onJobTitleChange: (value: string) => void;
  onBack: () => void;
  onStartEvaluation: () => void;
}

export function JobTitleStep({
  jobTitle,
  cvFile,
  projectReportFile,
  isLoading,
  onJobTitleChange,
  onBack,
  onStartEvaluation
}: JobTitleStepProps) {
  return (
    <div className="flex justify-center">
      <Card className="max-w-6xl w-full">
        <Card.Header>
          <div className="text-center">
            <Card.Title className="flex items-center justify-center space-x-3 text-xl">
              <FileText className="h-7 w-7" />
              <span>Target Position Details</span>
            </Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title *</Label>
              <Input
                id="job-title"
                placeholder="e.g. Product Engineer (Backend)"
                value={jobTitle}
                onChange={(e) => onJobTitleChange(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Enter the job title you&apos;re applying for. This helps our AI evaluate your CV
                and project against the specific requirements.
              </p>
            </div>

            {/* Uploaded Files Summary */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3">Uploaded Files:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{cvFile?.name}</span>
                  <Badge variant="outline">CV</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{projectReportFile?.name}</span>
                  <Badge variant="outline">Project Report</Badge>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={onStartEvaluation}
                disabled={!jobTitle.trim() || isLoading}
                size="lg"
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Evaluation...
                  </>
                ) : (
                  <>
                    {/* <Brain className="h-4 w-4 mr-2" /> */}
                    Start Evaluation
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}