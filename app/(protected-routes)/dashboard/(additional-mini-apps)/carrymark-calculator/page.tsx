"use client";

import React, { useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calculator,
  Plus,
  Trash2,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  RotateCcw,
  BookOpen,
  Award,
  BarChart3,
} from "lucide-react";

type ComponentRow = {
  id: string;
  name: string;
  weight: number;
  score: number | null;
  maxScore: number;
};

export default function CarryMarkCalculator() {
  const [rows, setRows] = useState<ComponentRow[]>([
    {
      id: crypto.randomUUID(),
      name: "Assignment",
      weight: 20,
      score: 80,
      maxScore: 100,
    },
    {
      id: crypto.randomUUID(),
      name: "Quiz",
      weight: 10,
      score: 35,
      maxScore: 40,
    },
    {
      id: crypto.randomUUID(),
      name: "Test",
      weight: 20,
      score: null,
      maxScore: 50,
    },
    {
      id: crypto.randomUUID(),
      name: "Final Exam",
      weight: 50,
      score: null,
      maxScore: 100,
    },
  ]);

  const [target, setTarget] = useState<number>(50);
  const [courseTotalWeightWarning, setCourseTotalWeightWarning] = useState<
    string | null
  >(null);

  function updateRow(id: string, patch: Partial<ComponentRow>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [
      ...rs,
      {
        id: crypto.randomUUID(),
        name: "New",
        weight: 0,
        score: null,
        maxScore: 100,
      },
    ]);
  }

  function removeRow(id: string) {
    setRows((rs) => rs.filter((r) => r.id !== id));
  }

  const totalWeight = rows.reduce((s, r) => s + Number(r.weight || 0), 0);
  const completedWeight = rows.reduce(
    (s, r) => s + (r.score !== null ? Number(r.weight || 0) : 0),
    0
  );
  const weightedScoreSum = rows.reduce(
    (s, r) =>
      s +
      (r.score !== null
        ? (Number(r.score || 0) / (r.maxScore || 100)) * Number(r.weight || 0)
        : 0),
    0
  );

  const carryMark = weightedScoreSum;
  const currentCarryRelative =
    completedWeight > 0 ? (weightedScoreSum / completedWeight) * 100 : 0;
  const remainingWeight = Math.max(0, 100 - completedWeight);

  const requiredOnRemaining =
    remainingWeight > 0
      ? ((target - weightedScoreSum) * 100) / remainingWeight
      : null;

  React.useEffect(() => {
    if (totalWeight === 100) {
      setCourseTotalWeightWarning(null);
    } else {
      setCourseTotalWeightWarning(
        `Total weights currently add up to ${totalWeight}%. It's best to have 100% as the course total.`
      );
    }
  }, [totalWeight]);

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "text-emerald-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              CarryMark Calculator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plan your academic success by calculating your current progress and
            required scores for future assessments
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700 font-medium">
                    Current Carry
                  </p>
                  <p
                    className={`text-2xl font-bold ${getGradeColor(carryMark)}`}
                  >
                    {carryMark.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {completedWeight}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-amber-700 font-medium">
                    Remaining
                  </p>
                  <p className="text-2xl font-bold text-amber-800">
                    {remainingWeight}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium">Target</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {target}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Course Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  Progress towards target ({target}%)
                </span>
                <span className="font-semibold">
                  {((carryMark / target) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(carryMark / target) * 100} className="h-3" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Course completion</span>
                <span className="font-semibold">{completedWeight}%</span>
              </div>
              <Progress value={completedWeight} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Target Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Target Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label className="text-sm font-medium">
                  Target Course Mark (%)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value || 0))}
                  className="mt-1"
                />
              </div>

              <div className="flex-1">
                <Label className="text-sm font-medium">
                  Required Average on Remaining
                </Label>
                <div className="mt-1 p-3 bg-background rounded-lg border">
                  <div className="text-lg font-semibold">
                    {remainingWeight === 0
                      ? target <= carryMark
                        ? "Target Met! 🎉"
                        : "Target Not Met ❌"
                      : `${
                          requiredOnRemaining !== null
                            ? requiredOnRemaining.toFixed(1)
                            : "—"
                        }%`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {remainingWeight === 0
                      ? "No remaining assessments can change your mark"
                      : requiredOnRemaining !== null &&
                        requiredOnRemaining <= 100
                      ? "Average needed on remaining assessments"
                      : requiredOnRemaining !== null &&
                        requiredOnRemaining > 100
                      ? "Target may not be achievable with current marks"
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Components */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Assessment Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rows.map((r) => {
                const percentage =
                  r.score !== null ? (r.score / r.maxScore) * 100 : null;
                const isCompleted = r.score !== null;

                return (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isCompleted
                        ? ""
                        : "border-gray-300 dark:border-gray-500 border-dashed"
                    }`}
                  >
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3">
                      {/* Assessment Name */}
                      <div className="lg:col-span-3">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Assessment Name
                        </Label>
                        <Input
                          value={r.name}
                          onChange={(e) =>
                            updateRow(r.id, { name: e.target.value })
                          }
                          className="mt-1 font-medium"
                          placeholder="e.g. Assignment 1"
                        />
                      </div>

                      {/* Weight */}
                      <div className="lg:col-span-2">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Weight (%)
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={r.weight}
                          onChange={(e) => {
                            let v = Number(e.target.value);
                            if (isNaN(v)) v = 0;
                            updateRow(r.id, {
                              weight: Math.max(0, Math.min(100, v)),
                            });
                          }}
                          className="mt-1 font-mono"
                        />
                      </div>

                      {/* Score */}
                      <div className="lg:col-span-2">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Your Score
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={r.maxScore}
                          placeholder="Not graded"
                          value={r.score === null ? "" : String(r.score)}
                          onChange={(e) => {
                            const raw = e.target.value.trim();
                            if (raw === "") {
                              updateRow(r.id, { score: null });
                              return;
                            }
                            let v = Number(raw);
                            if (isNaN(v)) v = 0;
                            v = Math.max(0, Math.min(r.maxScore, v));
                            updateRow(r.id, { score: v });
                          }}
                          className="mt-1 font-mono"
                        />
                      </div>

                      {/* Max Score */}
                      <div className="lg:col-span-2">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Max Score
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={1000}
                          value={r.maxScore}
                          onChange={(e) => {
                            let v = Number(e.target.value);
                            if (isNaN(v) || v < 1) v = 1;
                            updateRow(r.id, { maxScore: v });
                          }}
                          className="mt-1 font-mono"
                        />
                      </div>

                      {/* Percentage & Status */}
                      <div className="lg:col-span-2">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Performance
                        </Label>
                        <div className="mt-1 flex items-center gap-2">
                          {isCompleted ? (
                            <>
                              <Badge
                                variant="secondary"
                                className={`${getGradeColor(
                                  percentage!
                                )} font-semibold`}
                              >
                                {percentage!.toFixed(1)}%
                              </Badge>
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="lg:col-span-1 flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRow(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress bar for completed assessments */}
                    {isCompleted && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Score Progress</span>
                          <span>
                            {r.score}/{r.maxScore}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={percentage!} className="h-2" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={addRow} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Assessment
                </Button>
                <Button
                  onClick={() =>
                    setRows([
                      {
                        id: crypto.randomUUID(),
                        name: "Assignment",
                        weight: 20,
                        score: 80,
                        maxScore: 100,
                      },
                      {
                        id: crypto.randomUUID(),
                        name: "Quiz",
                        weight: 10,
                        score: 35,
                        maxScore: 40,
                      },
                      {
                        id: crypto.randomUUID(),
                        name: "Test",
                        weight: 20,
                        score: null,
                        maxScore: 50,
                      },
                      {
                        id: crypto.randomUUID(),
                        name: "Final Exam",
                        weight: 50,
                        score: null,
                        maxScore: 100,
                      },
                    ])
                  }
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Example
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Performance */}
              <div className="space-y-4">
                <h3 className="font-semibold border-b pb-2">
                  Current Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-sm ">Course Total Weight</span>
                    <Badge
                      variant={totalWeight === 100 ? "default" : "destructive"}
                    >
                      {totalWeight}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                    <span className="text-sm dark:text-blue-100 text-blue-950">
                      Completed Weight
                    </span>
                    <Badge variant="secondary">{completedWeight}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                    <span className="text-sm dark:text-emerald-100 text-emerald-950">
                      Current Carry Mark
                    </span>
                    <Badge
                      variant="secondary"
                      className={`${getGradeColor(carryMark)} font-bold`}
                    >
                      {carryMark.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <span className="text-sm dark:text-purple-100 text-purple-950">
                      Relative Performance
                    </span>
                    <Badge variant="secondary">
                      {completedWeight > 0
                        ? `${currentCarryRelative.toFixed(1)}%`
                        : "—"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Future Planning */}
              <div className="space-y-4">
                <h3 className="font-semibold  border-b pb-2">
                  Future Planning
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                    <span className="text-sm dark:text-amber-100 text-amber-950">
                      Remaining Weight
                    </span>
                    <Badge variant="secondary">{remainingWeight}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 dark:bg-indigo-950 bg-indigo-50 rounded-lg">
                    <span className="text-sm dark:text-indigo-100 text-indigo-950">
                      Target Mark
                    </span>
                    <Badge variant="secondary">{target}%</Badge>
                  </div>
                  <div className="p-3 bg-gradient-to-r dark:from-purple-950 dark:to-pink-950 from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-sm  mb-1">Required Average</div>
                    <div className="font-bold text-lg">
                      {remainingWeight === 0
                        ? target <= carryMark
                          ? "🎯 Target Achieved!"
                          : "❌ Target Missed"
                        : requiredOnRemaining !== null
                        ? `${requiredOnRemaining.toFixed(1)}%`
                        : "—"}
                    </div>
                    <div className="text-xs  mt-1">
                      {remainingWeight === 0
                        ? "No more assessments to change your final mark"
                        : requiredOnRemaining !== null &&
                          requiredOnRemaining <= 100
                        ? "You need this average on remaining assessments"
                        : requiredOnRemaining !== null &&
                          requiredOnRemaining > 100
                        ? "⚠️ Target may not be achievable"
                        : "Complete more assessments for calculation"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warnings */}
        {courseTotalWeightWarning && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-100" />
            <AlertDescription className="text-amber-800 dark:text-amber-100">
              {courseTotalWeightWarning}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Center */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-900 to-blue-900 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-semibold text-lg">Ready to Share?</h3>
                <p className="text-slate-300 text-sm">
                  Copy your calculation summary to share or save
                </p>
              </div>
              <Button
                onClick={() => {
                  const summary = `🎓 CarryMark Calculator Summary
                  
📊 Current Performance:
• Carry Mark: ${carryMark.toFixed(2)}%
• Completed: ${completedWeight}%
• Remaining: ${remainingWeight}%

🎯 Target Analysis:
• Target: ${target}%
• Required Average: ${
                    remainingWeight > 0
                      ? requiredOnRemaining !== null
                        ? requiredOnRemaining.toFixed(2) + "%"
                        : "—"
                      : "—"
                  }

📈 Assessment Breakdown:
${rows
  .map(
    (r) =>
      `• ${r.name}: ${
        r.score !== null
          ? `${r.score}/${r.maxScore} (${((r.score / r.maxScore) * 100).toFixed(
              1
            )}%)`
          : "Not graded"
      } - ${r.weight}% weight`
  )
  .join("\n")}`;

                  navigator.clipboard?.writeText(summary);
                  alert("📋 Summary copied to clipboard!");
                }}
                className="bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-2 px-6"
              >
                <Copy className="h-4 w-4" />
                Copy Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
