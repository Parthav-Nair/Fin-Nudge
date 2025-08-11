import React from "react";
import { Card, CardContent } from "@/components/ui/Card";

export default function NudgeCard({ text, meta }) {
  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="text-lg font-semibold">Personalized Nudge</div>
        <div className="mt-2 text-gray-700">{text}</div>
        {meta && <div className="mt-3 text-xs text-gray-500">Model: {meta.model} · tokens: {meta.tokens}</div>}
      </div>
    </Card>
  );
}
