import React, { useEffect, useState } from "react";
import { getTransactions, getNudges, getNudgeMetrics } from "@/api/api";
import NudgeCard from "@/components/NudgeCard";
import MetricsCard from "@/components/MetricsCard";
import TransactionsTable from "@/components/TransactionsTable";

export default function DashboardPage() {
  const [nudge, setNudge] = useState({ text: "Loading...", meta: null });
  const [metrics, setMetrics] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [nudgesRes, metricsRes, txRes] = await Promise.all([
          getNudges(),
          getNudgeMetrics(),
          getTransactions()
        ]);
        // Adapt to expected payload shapes
        const nudgeData = Array.isArray(nudgesRes.data) ? nudgesRes.data[0] : nudgesRes.data;
        setNudge({ text: nudgeData?.nudge || nudgeData?.message || "No nudge available", meta: nudgeData?.meta || null });
        setMetrics(metricsRes.data || {});
        setTransactions(txRes.data || []);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.error || err?.message || "Failed to load dashboard");
      }
    })();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {error && <div className="text-red-600">{error}</div>}
      <NudgeCard text={nudge.text} meta={nudge.meta} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.keys(metrics).length === 0 ? <div className="text-gray-500">No metrics</div> :
          Object.entries(metrics).map(([k, v]) => <MetricsCard key={k} title={k} value={v} />)}
      </div>
      <TransactionsTable transactions={transactions} />
    </div>
  );
}
