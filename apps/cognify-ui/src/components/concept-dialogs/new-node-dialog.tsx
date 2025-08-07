"use client";

import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface NewNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (name: string, description: string, importance: number) => void;
  importances: Record<
    string,
    { code: number; category: string; description: string }
  >;
}

export function NewNodeDialog({
  isOpen,
  onClose,
  onAddNode,
  importances,
}: NewNodeDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState<number>(400);

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) return;

    onAddNode(name, description, importance);
    setName("");
    setDescription("");
    setImportance(400);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Concept</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Concept Name"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <select
            value={importance}
            onChange={(e) => setImportance(Number(e.target.value))}
            className="rounded-md border p-2"
          >
            {Object.values(importances).map(({ code, category }) => (
              <option key={code} value={code}>
                {category} ({code})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
