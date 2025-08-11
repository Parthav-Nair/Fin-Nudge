import React from "react";

export function SimpleTable({ children, className }) {
  return <table className={`min-w-full ${className || ""}`}>{children}</table>;
}
export const THead = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
export const TBody = ({ children }) => <tbody className="divide-y">{children}</tbody>;
export const TH = ({ children, className }) => <th className={"px-4 py-2 text-left text-sm text-gray-600 " + (className||"")}>{children}</th>;
export const TD = ({ children, className }) => <td className={"px-4 py-2 text-sm " + (className||"")}>{children}</td>;
