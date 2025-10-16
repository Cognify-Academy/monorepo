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
import { type Edge } from "@xyflow/react";
import { useEffect, useState } from "react";

interface IdeaEdge extends Edge {
  data?: {
    label?: string;
    weighting?: number;
  };
  label?: string;
  weighting?: number;
}

interface EditEdgeDialogProps {
  edge: IdeaEdge | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEdge: IdeaEdge) => void;
}

export function EditEdgeDialog({
  edge,
  isOpen,
  onClose,
  onSave,
}: EditEdgeDialogProps) {
  const [description, setDescription] = useState("");
  const [weighting, setWeighting] = useState(0.5);

  useEffect(() => {
    if (edge) {
      // Get data from edge.data object
      const edgeData = edge.data || {};
      setDescription(typeof edgeData.label === "string" ? edgeData.label : "");
      setWeighting(
        typeof edgeData.weighting === "number" ? edgeData.weighting : 0.5,
      );
    }
  }, [edge]);

  const handleSave = () => {
    if (edge) {
      onSave({
        ...edge,
        data: { ...edge.data, label: description, weighting },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Relationship</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
              htmlFor="weighting"
              className="text-right text-gray-700 dark:text-gray-300"
            >
              Weighting
            </label>
            <TextInput
              id="weighting"
              type="number"
              value={weighting}
              onChange={(e) => setWeighting(Number(e.target.value))}
              className="col-span-3"
            />
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
