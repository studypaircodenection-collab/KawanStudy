"use client";

import React from "react";
import {
  SparklesIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  RefreshCw,
  Clock,
  Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import useAISummary from "@/hooks/use-ai-summary";

interface AISummaryComponentProps {
  quizId: string;
  attemptsCount: number;
  className?: string;
}

export function AISummaryComponent({
  quizId,
  attemptsCount,
  className = "",
}: AISummaryComponentProps) {
  const { data, isLoading, error, generateSummary, refetch } = useAISummary(
    quizId,
    attemptsCount >= 2
  );

  const getTrendIcon = (trendText: string) => {
    const trend = trendText.toLowerCase();
    if (
      trend.includes("improv") ||
      trend.includes("better") ||
      trend.includes("progress")
    ) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (
      trend.includes("declin") ||
      trend.includes("worse") ||
      trend.includes("drop")
    ) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getConfidenceBadge = (confidence?: string) => {
    const variant =
      confidence === "high"
        ? "default"
        : confidence === "medium"
        ? "secondary"
        : "outline";
    return (
      <Badge variant={variant} className="text-xs">
        {confidence || "medium"} confidence
      </Badge>
    );
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }
  };

  if (attemptsCount < 2) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-muted-foreground" />
            <span>AI Performance Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <SparklesIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Not enough data yet</h3>
            <p className="text-muted-foreground mb-4">
              Take at least 2 quiz attempts to generate an AI-powered
              performance analysis
            </p>
            <Badge variant="outline">
              {attemptsCount}/2 attempts completed
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5" />
            <span>AI Performance Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Generating AI analysis...</span>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5" />
            <span>AI Performance Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={generateSummary}
            variant="outline"
            className="mt-4"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5" />
            <span>AI Performance Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generate AI Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Get personalized insights about your quiz performance
            </p>
            <Button onClick={generateSummary} disabled={isLoading}>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Generate Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
            <span>AI Performance Analysis</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getConfidenceBadge(data.confidence_level)}
            <Button
              onClick={generateSummary}
              variant="ghost"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Updated {formatLastUpdated(data.last_updated)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>•</span>
            <span>{data.attempts_analyzed} attempts analyzed</span>
          </div>
          {data.from_cache && (
            <Badge variant="outline" className="text-xs">
              Cached
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Performance */}
        <div>
          <h4 className="font-semibold mb-2">Overall Assessment</h4>
          <p className="text-muted-foreground leading-relaxed">
            {data.summary}
          </p>
        </div>

        {/* Performance Trend */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center space-x-2">
            {getTrendIcon(data.trend_analysis)}
            <span>Performance Trend</span>
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            {data.trend_analysis}
          </p>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Strengths</span>
            </h4>
            <ul className="space-y-2">
              {data.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                  <span className="text-muted-foreground">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center space-x-2 text-orange-700">
              <AlertCircle className="h-4 w-4" />
              <span>Areas for Improvement</span>
            </h4>
            <ul className="space-y-2">
              {data.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <AlertCircle className="h-3 w-3 mt-1 text-orange-600 flex-shrink-0" />
                  <span className="text-muted-foreground">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center space-x-2 text-blue-700">
            <Lightbulb className="h-4 w-4" />
            <span>Recommendations</span>
          </h4>
          <ul className="space-y-2">
            {data.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <Lightbulb className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                <span className="text-muted-foreground">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Generate New Analysis Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={generateSummary}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isLoading ? "Generating..." : "Generate Updated Analysis"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AISummaryComponent;
