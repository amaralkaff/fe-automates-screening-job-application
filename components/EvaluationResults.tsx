'use client';

import { Card } from '@/components/retroui/Card';
import { Badge } from '@/components/retroui/Badge';
import { Progress } from '@/components/retroui/Progress';
import { Button } from '@/components/retroui/Button';
import { Alert } from '@/components/retroui/Alert';
import {
  Star,
  TrendingUp,
  User,
  FileText,
  Brain,
  Download,
  Share2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { EvaluationResult } from '@/lib/api';

interface EvaluationResultsProps {
  result: EvaluationResult;
  onNewEvaluation?: () => void;
}

interface ScoreBreakdownProps {
  title: string;
  icon: React.ReactNode;
  scores: {
    label: string;
    value: number;
    weight: number;
    description: string;
  }[];
  overallScore: number;
  maxScore: number;
}

function ScoreBreakdown({ title, icon, scores, overallScore, maxScore }: ScoreBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    if (score >= 1.5) return 'Below Average';
    return 'Poor';
  };

  const getProgressColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-500';
    if (score >= 3.5) return 'bg-blue-500';
    if (score >= 2.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
          <Badge variant="outline" className={`ml-auto ${getScoreColor(overallScore)}`}>
            {overallScore.toFixed(1)}/{maxScore} - {getScoreLabel(overallScore)}
          </Badge>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Overall Score (out of {maxScore})
            </div>
            <Progress
              value={(overallScore / maxScore) * 100}
              className="mt-3 h-3"
            />
          </div>

          {/* Detailed Scores */}
          <div className="space-y-4">
            {scores.map((score, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{score.label}</div>
                    <div className="text-xs text-muted-foreground">
                      Weight: {score.weight}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getScoreColor(score.value)}`}>
                      {score.value.toFixed(1)}/5
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getScoreLabel(score.value)}
                    </div>
                  </div>
                </div>
                <Progress
                  value={(score.value / 5) * 100}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {score.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

export default function EvaluationResults({ result, onNewEvaluation }: EvaluationResultsProps) {
  const cvScores = result.result ? [
    {
      label: 'Technical Skills Match',
      value: result.result.cvEvaluation.technicalSkillsMatch.score,
      details: result.result.cvEvaluation.technicalSkillsMatch.details,
      weight: 40,
      description: 'Alignment with job requirements (backend, databases, APIs, cloud, AI/LLM)'
    },
    {
      label: 'Experience Level',
      value: result.result.cvEvaluation.experienceLevel.score,
      details: result.result.cvEvaluation.experienceLevel.details,
      weight: 25,
      description: 'Years of experience and project complexity'
    },
    {
      label: 'Relevant Achievements',
      value: result.result.cvEvaluation.relevantAchievements.score,
      details: result.result.cvEvaluation.relevantAchievements.details,
      weight: 20,
      description: 'Impact of past work (scaling, performance, adoption)'
    },
    {
      label: 'Cultural / Collaboration Fit',
      value: result.result.cvEvaluation.culturalFit.score,
      details: result.result.cvEvaluation.culturalFit.details,
      weight: 15,
      description: 'Communication, learning mindset, teamwork/leadership'
    }
  ] : [];

  const projectScores = result.result ? [
    {
      label: 'Correctness (Prompt & Chaining)',
      value: result.result.projectEvaluation.correctness.score,
      details: result.result.projectEvaluation.correctness.details,
      weight: 30,
      description: 'Implements prompt design, LLM chaining, RAG context injection'
    },
    {
      label: 'Code Quality & Structure',
      value: result.result.projectEvaluation.codeQuality.score,
      details: result.result.projectEvaluation.codeQuality.details,
      weight: 25,
      description: 'Clean, modular, reusable, tested'
    },
    {
      label: 'Resilience & Error Handling',
      value: result.result.projectEvaluation.resilience.score,
      details: result.result.projectEvaluation.resilience.details,
      weight: 20,
      description: 'Handles long jobs, retries, randomness, API failures'
    },
    {
      label: 'Documentation & Explanation',
      value: result.result.projectEvaluation.documentation.score,
      details: result.result.projectEvaluation.documentation.details,
      weight: 15,
      description: 'README clarity, setup instructions, trade-off explanations'
    },
    {
      label: 'Creativity / Bonus',
      value: result.result.projectEvaluation.creativity.score,
      details: result.result.projectEvaluation.creativity.details,
      weight: 10,
      description: 'Extra features beyond requirements'
    }
  ] : [];

  const getOverallRecommendation = () => {
    const cvScore = result.result ? result.result.finalScore.cvScore : 0;
    const projectScore = result.result ? result.result.finalScore.projectScore : 0;
    const average = result.result ? result.result.finalScore.overallScore : 0;

    if (average >= 4.0) {
      return {
        status: 'Highly Recommended',
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: <CheckCircle className="h-5 w-5" />
      };
    } else if (average >= 3.0) {
      return {
        status: 'Recommended',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: <Info className="h-5 w-5" />
      };
    } else if (average >= 2.0) {
      return {
        status: 'Consider with Reservations',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: <AlertTriangle className="h-5 w-5" />
      };
    } else {
      return {
        status: 'Not Recommended',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: <AlertTriangle className="h-5 w-5" />
      };
    }
  };

  const recommendation = getOverallRecommendation();
  const completedAt = result.updatedAt ? new Date(result.updatedAt) : null;

  const handleDownloadReport = () => {
    // Create a text report
    const report = `
Job Evaluation Report
=====================

Evaluation ID: ${result.id}
Completed: ${completedAt?.toLocaleString() || 'Unknown'}

OVERALL RECOMMENDATION: ${recommendation.status}

CV Evaluation Results:
----------------------
CV Score: ${result.result ? result.result.finalScore.cvScore.toFixed(1) : 'N/A'}/5
${result.result ? `- Technical Skills Match: ${result.result.cvEvaluation.technicalSkillsMatch.score.toFixed(1)}/5
  ${result.result.cvEvaluation.technicalSkillsMatch.details}` : ''}
${result.result ? `- Experience Level: ${result.result.cvEvaluation.experienceLevel.score.toFixed(1)}/5
  ${result.result.cvEvaluation.experienceLevel.details}` : ''}
${result.result ? `- Relevant Achievements: ${result.result.cvEvaluation.relevantAchievements.score.toFixed(1)}/5
  ${result.result.cvEvaluation.relevantAchievements.details}` : ''}
${result.result ? `- Cultural / Collaboration Fit: ${result.result.cvEvaluation.culturalFit.score.toFixed(1)}/5
  ${result.result.cvEvaluation.culturalFit.details}` : ''}

Project Evaluation Results:
--------------------------
Project Score: ${result.result ? result.result.finalScore.projectScore.toFixed(1) : 'N/A'}/5
${result.result ? `- Correctness (Prompt & Chaining): ${result.result.projectEvaluation.correctness.score.toFixed(1)}/5
  ${result.result.projectEvaluation.correctness.details}` : ''}
${result.result ? `- Code Quality & Structure: ${result.result.projectEvaluation.codeQuality.score.toFixed(1)}/5
  ${result.result.projectEvaluation.codeQuality.details}` : ''}
${result.result ? `- Resilience & Error Handling: ${result.result.projectEvaluation.resilience.score.toFixed(1)}/5
  ${result.result.projectEvaluation.resilience.details}` : ''}
${result.result ? `- Documentation & Explanation: ${result.result.projectEvaluation.documentation.score.toFixed(1)}/5
  ${result.result.projectEvaluation.documentation.details}` : ''}
${result.result ? `- Creativity / Bonus: ${result.result.projectEvaluation.creativity.score.toFixed(1)}/5
  ${result.result.projectEvaluation.creativity.details}` : ''}

AI-Generated Summary:
--------------------
${result.result?.overallSummary || 'Summary not available'}
    `.trim();

    // Download as text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-report-${result.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareResults = async () => {
    const shareData = {
      title: 'Job Evaluation Results',
      text: result.result
        ? `CV Score: ${result.result.finalScore.cvScore.toFixed(1)}/5, Project Score: ${result.result.finalScore.projectScore.toFixed(1)}/5`
        : 'Evaluation results available',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        {/* <h2 className="flex items-center justify-center space-x-2 text-xl font-bold">
          <TrendingUp className="h-6 w-6" />
          <span>Evaluation Results</span>
        </h2> */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          <div className="flex-1 flex justify-center">
            <Button variant="outline" size="sm" onClick={handleShareResults}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <div className="flex-1 flex justify-end">
            {onNewEvaluation && (
              <Button onClick={onNewEvaluation}>
                New Evaluation
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Overall Recommendation */}
      <Card className={`border-2 w-full ${recommendation.color}`}>
        <Card.Content className="p-6">
          <div className="flex items-center justify-center space-x-3">
            {/* <div className="p-2 rounded">
              {recommendation.icon}
            </div> */}
            <div className="text-center">
              <div className="text-xl font-bold">
                {recommendation.status}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Based on comprehensive AI analysis of CV and project
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Completion Info */}
      {completedAt && (
        <div className="text-sm text-muted-foreground text-center">
          Evaluation completed on {completedAt.toLocaleString()}
        </div>
      )}

      {/* Overall Summary */}
      <Card>
        <Card.Header>
          <div className="text-center">
            <Card.Title className="flex items-center justify-center space-x-2">
              <Brain className="h-6 w-6" />
              <span>Analysis Summary</span>
            </Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {result.result?.overallSummary || 'Evaluation summary not available'}
            </p>
          </div>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-center">Key Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <Card.Content className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600">
                {result.result ? (result.result.finalScore.cvScore * 20).toFixed(0) : '0'}%
              </div>
              <div className="text-sm text-muted-foreground">CV Match Rate</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center p-4">
              <div className="text-2xl font-bold text-green-600">
                {result.result ? result.result.cvEvaluation.technicalSkillsMatch.score.toFixed(1) : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Technical Skills</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600">
                {result.result ? result.result.finalScore.projectScore.toFixed(1) : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Project Score</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center p-4">
              <div className="text-2xl font-bold text-orange-600">
                {result.result ? result.result.projectEvaluation.codeQuality.score.toFixed(1) : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Code Quality</div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Score Breakdowns */}
      <div className="grid md:grid-cols-2 gap-6">
        <ScoreBreakdown
          title="CV Evaluation"
          icon={<User className="h-6 w-6" />}
          scores={cvScores}
          overallScore={result.result ? result.result.finalScore.cvScore : 0}
          maxScore={5}
        />

        <ScoreBreakdown
          title="Project Evaluation"
          icon={<FileText className="h-6 w-6" />}
          scores={projectScores}
          overallScore={result.result ? result.result.finalScore.projectScore : 0}
          maxScore={5}
        />
      </div>

      {/* Footer Note */}
      <Alert>
        <Info className="h-4 w-4" />
        <Alert.Description>
          This evaluation was generated by AI based on the analysis of your CV and project report
          against the specific job requirements and case study criteria. The scores are meant to
          provide objective feedback but should be considered as one part of the overall evaluation
          process.
        </Alert.Description>
      </Alert>
    </div>
  );
}