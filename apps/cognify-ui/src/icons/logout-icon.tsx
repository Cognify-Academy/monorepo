import clsx from "clsx";
import type React from "react";

export function LogoutIcon({
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
        d="M6 12H2V4H6M4 8H14M10 6L12 8L10 10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
