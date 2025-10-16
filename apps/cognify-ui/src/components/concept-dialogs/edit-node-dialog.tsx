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
import { type Node } from "@xyflow/react";
import { useEffect, useState } from "react";

interface EditNodeDialogProps {
  node?: Node;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedNode: Node) => void;
  importances: Record<
    string,
    { code: number; category: string; description: string }
  >;
}

export function EditNodeDialog({
  node,
  isOpen,
  onClose,
  onSave,
  importances,
}: EditNodeDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState(500);

  useEffect(() => {
    if (node && node.data) {
      setName(typeof node.data.label === "string" ? node.data.label : "");
      setDescription(
        typeof node?.data?.description === "string"
          ? node.data.description
          : "",
      );
      setImportance(
        typeof node.data.importance === "number" ? node.data.importance : 500,
      );
    }
  }, [node]);

  const handleSave = async () => {
    if (node) {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

      try {
        const result = await fetch(`${apiUrl}/api/v1/concepts/${node.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, description, importance }),
        });

        if (!result.ok) {
          alert("Failed to save node");
          return;
        }

        onSave({
          ...node,
          data: { ...node.data, label: name, description, importance },
        });
      } catch (error) {
        console.error("Error saving node:", error);
        alert("Failed to save node");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Concept</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="name"
              className="text-right text-gray-700 dark:text-gray-300"
            >
              Name
            </label>
            <TextInput
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="description"
              className="text-right text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="importance"
              className="text-right text-gray-700 dark:text-gray-300"
            >
              Importance
            </label>
            <select
              value={importance}
              onChange={(e) => setImportance(Number(e.target.value))}
              className="col-span-3 rounded-md border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              id="importance"
            >
              {Object.values(importances).map(({ code, category }) => (
                <option key={code} value={code}>
                  {category} ({code})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
