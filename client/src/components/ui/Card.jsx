import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("rounded-lg bg-white shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}
export function CardHeader({ children, className }) {
  return <div className={cn("px-4 py-3 border-b", className)}>{children}</div>;
}
export function CardContent({ children, className }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
