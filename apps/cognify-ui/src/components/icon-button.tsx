import { Button } from "@headlessui/react";
import { clsx } from "clsx";
import React from "react";

interface IconButtonProps extends React.ComponentProps<typeof Button> {
  className?: string;
}

export function IconButton({ className, ...props }: IconButtonProps) {
  return (
    <Button
      type="button"
      className={clsx(
        className,
        "relative *:relative",
        "before:-translate-1/2 before:absolute before:left-1/2 before:top-1/2 before:size-8 before:rounded-md",
        "before:bg-white/75 before:backdrop-blur-sm dark:before:bg-gray-950/75",
        "data-hover:before:bg-gray-950/5 dark:data-hover:before:bg-white/5",
        "focus:outline-hidden data-focus:before:outline-2 data-focus:before:outline-blue-700 data-focus:before:outline-solid",
      )}
      {...props}
    />
  );
}
