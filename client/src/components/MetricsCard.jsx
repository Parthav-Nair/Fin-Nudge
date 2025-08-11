import React from "react";
import { Card, CardContent } from "@/components/ui/Card";

export default function MetricsCard({ title, value }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  );
}
