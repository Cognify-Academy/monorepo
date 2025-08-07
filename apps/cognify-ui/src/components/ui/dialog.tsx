"use client";

import { CloseIcon } from "@/icons/close-icon";
import {
  DialogBackdrop,
  DialogPanel,
  Dialog as HeadlessDialog,
} from "@headlessui/react";
import React from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: any;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <HeadlessDialog
      open={open}
      onClose={() => onOpenChange(false)}
      className="relative z-50"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/25" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg space-y-4 rounded-lg bg-white p-12 shadow-lg">
          {children}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
}

export function DialogContent({
  className = "",
  children,
}: {
  className?: string;
  children: any;
}) {
  return <div className={className}>{children}</div>;
}

export function DialogHeader({ children }: { children: any }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: any }) {
  return <h2 className="text-lg font-semibold text-gray-900">{children}</h2>;
}
