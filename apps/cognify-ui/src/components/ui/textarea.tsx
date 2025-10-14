"use client";

import { clsx } from "clsx";
import type React from "react";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={clsx(
        className,
        "block w-full rounded-lg bg-white px-3 py-1.5",
        "text-base/6 sm:text-sm/6",
        "outline -outline-offset-1 outline-gray-950/15 focus:outline-2 focus:outline-blue-500",
      )}
      {...props}
    />
  );
}
