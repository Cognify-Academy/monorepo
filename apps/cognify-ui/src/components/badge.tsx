import { clsx } from "clsx";
import type React from "react";

export interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-gray-950 text-white",
    secondary:
      "border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
    destructive: "border-transparent bg-red-600 text-white",
    outline:
      "border-gray-300 text-gray-900 dark:border-gray-600 dark:text-gray-100",
  };

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
