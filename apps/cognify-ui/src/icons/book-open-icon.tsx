import clsx from "clsx";
import type React from "react";

export function BookOpenIcon({
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
      <path
        d="M2 3C2 2.44772 2.44772 2 3 2H6C6.55228 2 7 2.44772 7 3V13C7 13.5523 6.55228 14 6 14H3C2.44772 14 2 13.5523 2 13V3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 3C9 2.44772 9.44772 2 10 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H10C9.44772 14 9 13.5523 9 13V3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
