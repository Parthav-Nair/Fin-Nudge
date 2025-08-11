import React from "react";
import { SimpleTable, THead, TBody, TH, TD } from "@/components/ui/Table";

export default function TransactionsTable({ transactions }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="text-lg font-semibold mb-2">Recent Transactions</div>
      <SimpleTable>
        <THead>
          <tr>
            <TH>Date</TH>
            <TH>Description</TH>
            <TH className="text-right">Amount</TH>
          </tr>
        </THead>
        <TBody>
          {transactions.length === 0 && (
            <tr><TD colSpan="3" className="text-center text-gray-500 py-4">No transactions</TD></tr>
          )}
          {transactions.map(tx => (
            <tr key={tx.id || tx._id || Math.random()}>
              <TD>{tx.date || tx.createdAt || "—"}</TD>
              <TD>{tx.description || tx.title || "—"}</TD>
              <TD className="text-right">{tx.amount ?? "—"}</TD>
            </tr>
          ))}
        </TBody>
      </SimpleTable>
    </div>
  );
}
