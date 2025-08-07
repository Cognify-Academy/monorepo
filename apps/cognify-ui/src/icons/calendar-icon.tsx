import clsx from "clsx";
import type React from "react";

export function CalendarIcon({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={clsx(className, "h-4 shrink-0")}
      {...props}
    >
      <rect x="2" y="3" width="12" height="11" rx="1" />
      <path d="M2 6H14" />
      <path d="M6 2V4" />
      <path d="M10 2V4" />
    </svg>
  );
}
