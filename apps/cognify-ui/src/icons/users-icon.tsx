import clsx from "clsx";
import type React from "react";

export function UsersIcon({
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
      <circle cx="6" cy="6" r="2" />
      <path d="M2 14C2 11.7909 3.79086 10 6 10C8.20914 10 10 11.7909 10 14" />
      <circle cx="12" cy="4" r="1" />
      <path d="M14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12" />
    </svg>
  );
}
