"use client";

import React, { useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const uid = (() => {
  let i = 1;
  return () => i++;
})();

type ComponentRow = {
  id: number;
  name: string;
  weight: number;
  score: number | null;
  maxScore: number;
};

export default function CarryMarkCalculator() {
  const [rows, setRows] = useState<ComponentRow[]>([
    { id: uid(), name: "Assignment", weight: 20, score: 80, maxScore: 100 },
    { id: uid(), name: "Quiz", weight: 10, score: 35, maxScore: 40 },
    { id: uid(), name: "Test", weight: 20, score: null, maxScore: 50 },
    { id: uid(), name: "Final Exam", weight: 50, score: null, maxScore: 100 },
  ]);

  const [target, setTarget] = useState<number>(50);
  const [courseTotalWeightWarning, setCourseTotalWeightWarning] = useState<
    string | null
  >(null);

  function updateRow(id: number, patch: Partial<ComponentRow>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [
      ...rs,
      { id: uid(), name: "New", weight: 0, score: null, maxScore: 100 },
    ]);
  }

  function removeRow(id: number) {
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

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      <Card className="space-y-4">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            CarryMark Calculator
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm mb-4">
            Create components (assignments, quizzes, tests, final) with their
            weight (%) and the score you obtained (leave blank if not graded).
            You can also adjust the maximum score for each component.
          </p>

          <div className="flex flex-col gap-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:grid sm:grid-cols-12 gap-2 items-end border rounded p-2"
              >
                <div className="w-full sm:col-span-3">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={r.name}
                    onChange={(e) => updateRow(r.id, { name: e.target.value })}
                  />
                </div>

                <div className="w-full sm:col-span-2">
                  <Label className="text-xs">Weight (%)</Label>
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
                  />
                </div>

                <div className="w-full sm:col-span-3">
                  <Label className="text-xs">Score</Label>
                  <Input
                    type="number"
                    min={0}
                    max={r.maxScore}
                    placeholder="leave empty if not graded"
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
                  />
                </div>

                <div className="w-full sm:col-span-2">
                  <Label className="text-xs">Max Score</Label>
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
                  />
                </div>

                <div className="w-full flex justify-end sm:col-span-2">
                  <Button
                    variant="outline"
                    onClick={() => removeRow(r.id)}
                    className="h-9 w-full sm:w-auto"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={addRow} className="w-full sm:w-auto">
                Add component
              </Button>
              <Button
                onClick={() =>
                  setRows([
                    {
                      id: uid(),
                      name: "Assignment",
                      weight: 20,
                      score: 80,
                      maxScore: 100,
                    },
                    {
                      id: uid(),
                      name: "Quiz",
                      weight: 10,
                      score: 35,
                      maxScore: 40,
                    },
                    {
                      id: uid(),
                      name: "Test",
                      weight: 20,
                      score: null,
                      maxScore: 50,
                    },
                    {
                      id: uid(),
                      name: "Final Exam",
                      weight: 50,
                      score: null,
                      maxScore: 100,
                    },
                  ])
                }
                variant="ghost"
                className="w-full sm:w-auto"
              >
                Reset example
              </Button>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 items-end">
              <div className="w-full sm:col-span-4">
                <Label className="text-xs">Target course mark (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value || 0))}
                />
              </div>

              <div className="w-full sm:col-span-8">
                <Label className="text-xs">Notes</Label>
                <div className="p-2 border rounded text-sm">
                  <div>
                    • Course total weight: <strong>{totalWeight}%</strong>
                  </div>
                  <div>
                    • Completed weight (graded):{" "}
                    <strong>{completedWeight}%</strong>
                  </div>
                  <div>
                    • Current carry (contribution to course):{" "}
                    <strong>{carryMark.toFixed(2)}%</strong>
                  </div>
                  <div>
                    • Current carry relative to graded items:{" "}
                    <strong>
                      {completedWeight > 0
                        ? `${currentCarryRelative.toFixed(2)}%`
                        : "—"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 border rounded">
                <div className="text-sm text-slate-500">
                  Carry Mark (so far)
                </div>
                <div className="text-xl sm:text-2xl font-semibold">
                  {carryMark.toFixed(2)}%
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  This is the weighted contribution to your final course mark
                  from graded components.
                </div>
              </div>

              <div className="p-4 border rounded">
                <div className="text-sm text-slate-500">Remaining weight</div>
                <div className="text-xl sm:text-2xl font-semibold">
                  {remainingWeight}%
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Weight left to be graded towards the course (assuming course
                  total is 100%).
                </div>
              </div>

              <div className="p-4 border rounded">
                <div className="text-sm text-slate-500">
                  Required average on remaining
                </div>
                <div className="text-xl sm:text-2xl font-semibold">
                  {remainingWeight === 0
                    ? target <= carryMark
                      ? "No remaining weight — target already met"
                      : "No remaining weight — target NOT met"
                    : `${
                        requiredOnRemaining !== null
                          ? requiredOnRemaining.toFixed(2)
                          : "—"
                      }%`}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {remainingWeight === 0
                    ? "There is no remaining weight to change your final mark."
                    : requiredOnRemaining !== null && requiredOnRemaining <= 100
                    ? "This is the average you must obtain on the remaining assessments to reach the target."
                    : requiredOnRemaining !== null && requiredOnRemaining > 100
                    ? "Required average is greater than 100% — target is unlikely with current marks."
                    : "—"}
                </div>
              </div>
            </div>

            {courseTotalWeightWarning && (
              <div className="mt-2 text-sm text-yellow-700">
                ⚠️ {courseTotalWeightWarning}
              </div>
            )}

            <div className="mt-4">
              <Button
                onClick={() => {
                  const summary = `CarryMark summary:\nCurrent carry: ${carryMark.toFixed(
                    2
                  )}%\nCompleted weight: ${completedWeight}%\nRemaining weight: ${remainingWeight}%\nTarget: ${target}%\nRequired on remaining: ${
                    remainingWeight > 0
                      ? requiredOnRemaining !== null
                        ? requiredOnRemaining.toFixed(2) + "%"
                        : "—"
                      : "—"
                  }`;
                  navigator.clipboard?.writeText(summary);
                  alert("Summary copied to clipboard");
                }}
                className="w-full sm:w-auto"
              >
                Copy summary
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
