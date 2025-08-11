import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border px-3 py-2 text-sm bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
